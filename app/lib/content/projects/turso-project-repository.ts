import { asc, eq, inArray, sql } from 'drizzle-orm';
import type { LibSQLDatabase } from 'drizzle-orm/libsql';
import { projectLinks, projects, projectTranslations } from '@/app/lib/db/schema';
import type { LinkType } from '@/app/lib/content/links';
import type { Locale } from '@/app/lib/i18n/locales';
import { isLocale } from '@/app/lib/i18n/routing';
import type { ProjectRepository } from './project-repository';
import type { ProjectInput, ProjectRecord, ProjectTranslation } from './project';

type ProjectRow = typeof projects.$inferSelect;

/** Adapter: ProjectRepository backed by Turso/libSQL through Drizzle. */
export function createTursoProjectRepository(db: LibSQLDatabase): ProjectRepository {
	/** Loads translations + links for the given rows and assembles records (keeps row order). */
	async function hydrate(rows: ProjectRow[]): Promise<ProjectRecord[]> {
		if (rows.length === 0) return [];
		const ids = rows.map((r) => r.id);
		const [translationRows, linkRows] = await Promise.all([
			db.select().from(projectTranslations).where(inArray(projectTranslations.projectId, ids)),
			db.select().from(projectLinks).where(inArray(projectLinks.projectId, ids)).orderBy(asc(projectLinks.position)),
		]);

		return rows.map((row) => {
			const translations: Partial<Record<Locale, ProjectTranslation>> = {};
			for (const t of translationRows) {
				if (t.projectId !== row.id || !isLocale(t.locale)) continue;
				translations[t.locale] = { title: t.title, summary: t.summary, description: t.description };
			}
			return {
				id: row.id,
				slug: row.slug,
				company: row.company,
				translations,
				links: linkRows
					.filter((l) => l.projectId === row.id)
					.map((l) => ({ type: l.type as LinkType, label: l.label, url: l.url })),
			};
		});
	}

	const findOne = async (where: ReturnType<typeof eq>) => {
		const rows = await db.select().from(projects).where(where).limit(1);
		return (await hydrate(rows))[0] ?? null;
	};

	/** Statements that (re)write a project's translations and links. */
	const childInserts = (id: number, input: ProjectInput) => [
		...(Object.entries(input.translations) as [Locale, ProjectTranslation][]).map(([locale, t]) =>
			db.insert(projectTranslations).values({ projectId: id, locale, ...t }),
		),
		...input.links.map((link, position) => db.insert(projectLinks).values({ projectId: id, ...link, position })),
	];

	const deleteChildren = (id: number) =>
		[
			db.delete(projectTranslations).where(eq(projectTranslations.projectId, id)),
			db.delete(projectLinks).where(eq(projectLinks.projectId, id)),
		] as const;

	return {
		async listProjects() {
			return hydrate(await db.select().from(projects).orderBy(asc(projects.position), asc(projects.id)));
		},

		getProject: (id) => findOne(eq(projects.id, id)),
		getProjectBySlug: (slug) => findOne(eq(projects.slug, slug)),

		async createProject(input) {
			// Interactive transaction: the generated id is needed for the child rows.
			return db.transaction(async (tx) => {
				const [{ first }] = await tx
					.select({ first: sql<number>`coalesce(min(${projects.position}), 0)` })
					.from(projects);
				const [{ id }] = await tx
					.insert(projects)
					.values({ slug: input.slug, company: input.company, position: first - 1 })
					.returning({ id: projects.id });
				for (const [locale, t] of Object.entries(input.translations) as [Locale, ProjectTranslation][]) {
					await tx.insert(projectTranslations).values({ projectId: id, locale, ...t });
				}
				for (const [position, link] of input.links.entries()) {
					await tx.insert(projectLinks).values({ projectId: id, ...link, position });
				}
				return id;
			});
		},

		async updateProject(id, input) {
			await db.batch([
				db
					.update(projects)
					.set({ slug: input.slug, company: input.company, updatedAt: sql`(unixepoch())` })
					.where(eq(projects.id, id)),
				...deleteChildren(id),
				...childInserts(id, input),
			]);
		},

		async deleteProject(id) {
			// Children first: does not rely on SQLite's foreign_keys pragma being on.
			await db.batch([...deleteChildren(id), db.delete(projects).where(eq(projects.id, id))]);
		},

		async reorderProjects(ids) {
			const [first, ...rest] = ids.map((id, position) =>
				db.update(projects).set({ position }).where(eq(projects.id, id)),
			);
			if (first) await db.batch([first, ...rest]);
		},
	};
}
