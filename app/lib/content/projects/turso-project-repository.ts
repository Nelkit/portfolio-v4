import { and, asc, eq, inArray, sql } from 'drizzle-orm';
import type { LibSQLDatabase } from 'drizzle-orm/libsql';
import { projectLinks, projects, projectScreenshots, projectSkills, projectTranslations, skills } from '@/app/lib/db/schema';
import { deleteOrphanSkills, resolveSkillIds, type Tx } from '@/app/lib/content/skills/skill-catalog';
import type { LinkType } from '@/app/lib/content/links';
import type { Locale } from '@/app/lib/i18n/locales';
import { isLocale } from '@/app/lib/i18n/routing';
import type { ProjectRepository } from './project-repository';
import type { ProjectInput, ProjectRecord, ProjectTranslation } from './project';

type ProjectRow = typeof projects.$inferSelect;

/** (Re)writes translations, links and skills of a project inside a transaction (images untouched). */
async function writeChildren(tx: Tx, id: number, input: ProjectInput) {
	await tx.delete(projectTranslations).where(eq(projectTranslations.projectId, id));
	await tx.delete(projectLinks).where(eq(projectLinks.projectId, id));
	await tx.delete(projectSkills).where(eq(projectSkills.projectId, id));
	for (const [locale, t] of Object.entries(input.translations) as [Locale, ProjectTranslation][]) {
		await tx.insert(projectTranslations).values({ projectId: id, locale, ...t });
	}
	for (const [position, link] of input.links.entries()) {
		await tx.insert(projectLinks).values({ projectId: id, ...link, position });
	}
	const skillIds = await resolveSkillIds(tx, input.skills);
	for (const [position, skillId] of skillIds.entries()) {
		await tx.insert(projectSkills).values({ projectId: id, skillId, position });
	}
	await deleteOrphanSkills(tx);
}

/** Adapter: ProjectRepository backed by Turso/libSQL through Drizzle. */
export function createTursoProjectRepository(db: LibSQLDatabase): ProjectRepository {
	/** Loads translations, links, skills and screenshots for the given rows (keeps row order). */
	async function hydrate(rows: ProjectRow[]): Promise<ProjectRecord[]> {
		if (rows.length === 0) return [];
		const ids = rows.map((r) => r.id);
		const [translationRows, linkRows, skillRows, screenshotRows] = await Promise.all([
			db.select().from(projectTranslations).where(inArray(projectTranslations.projectId, ids)),
			db.select().from(projectLinks).where(inArray(projectLinks.projectId, ids)).orderBy(asc(projectLinks.position)),
			db
				.select({ projectId: projectSkills.projectId, name: skills.name })
				.from(projectSkills)
				.innerJoin(skills, eq(skills.id, projectSkills.skillId))
				.where(inArray(projectSkills.projectId, ids))
				.orderBy(asc(projectSkills.position)),
			db
				.select()
				.from(projectScreenshots)
				.where(inArray(projectScreenshots.projectId, ids))
				.orderBy(asc(projectScreenshots.position), asc(projectScreenshots.id)),
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
				areaId: row.areaId,
				skills: skillRows.filter((s) => s.projectId === row.id).map((s) => s.name),
				imageKey: row.imageKey,
				translations,
				links: linkRows
					.filter((l) => l.projectId === row.id)
					.map((l) => ({ type: l.type as LinkType, label: l.label, url: l.url })),
				screenshots: screenshotRows
					.filter((s) => s.projectId === row.id)
					.map((s) => ({ id: s.id, key: s.key })),
			};
		});
	}

	const findOne = async (where: ReturnType<typeof eq>) => {
		const rows = await db.select().from(projects).where(where).limit(1);
		return (await hydrate(rows))[0] ?? null;
	};

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
					.values({ slug: input.slug, company: input.company, areaId: input.areaId, position: first - 1 })
					.returning({ id: projects.id });
				await writeChildren(tx, id, input);
				return id;
			});
		},

		async updateProject(id, input) {
			// Transaction (not batch): skill names must be resolved against the catalog first.
			await db.transaction(async (tx) => {
				await tx
					.update(projects)
					.set({ slug: input.slug, company: input.company, areaId: input.areaId, updatedAt: sql`(unixepoch())` })
					.where(eq(projects.id, id));
				await writeChildren(tx, id, input);
			});
		},

		async deleteProject(id) {
			const record = await findOne(eq(projects.id, id));
			if (!record) return [];
			// Children first: does not rely on SQLite's foreign_keys pragma being on.
			await db.transaction(async (tx) => {
				await tx.delete(projectTranslations).where(eq(projectTranslations.projectId, id));
				await tx.delete(projectLinks).where(eq(projectLinks.projectId, id));
				await tx.delete(projectSkills).where(eq(projectSkills.projectId, id));
				await tx.delete(projectScreenshots).where(eq(projectScreenshots.projectId, id));
				await tx.delete(projects).where(eq(projects.id, id));
				await deleteOrphanSkills(tx);
			});
			return [record.imageKey, ...record.screenshots.map((s) => s.key)].filter((k): k is string => Boolean(k));
		},

		async reorderProjects(ids) {
			const [first, ...rest] = ids.map((id, position) =>
				db.update(projects).set({ position }).where(eq(projects.id, id)),
			);
			if (first) await db.batch([first, ...rest]);
		},

		async setProjectImage(id, key) {
			const [row] = await db.select({ imageKey: projects.imageKey }).from(projects).where(eq(projects.id, id)).limit(1);
			await db.update(projects).set({ imageKey: key, updatedAt: sql`(unixepoch())` }).where(eq(projects.id, id));
			return row?.imageKey ?? null;
		},

		async addScreenshot(projectId, key) {
			const [{ last }] = await db
				.select({ last: sql<number>`coalesce(max(${projectScreenshots.position}), -1)` })
				.from(projectScreenshots)
				.where(eq(projectScreenshots.projectId, projectId));
			const [{ id }] = await db
				.insert(projectScreenshots)
				.values({ projectId, key, position: last + 1 })
				.returning({ id: projectScreenshots.id });
			return id;
		},

		async removeScreenshot(projectId, screenshotId) {
			const [row] = await db
				.delete(projectScreenshots)
				.where(and(eq(projectScreenshots.id, screenshotId), eq(projectScreenshots.projectId, projectId)))
				.returning({ key: projectScreenshots.key });
			return row?.key ?? null;
		},

		async reorderScreenshots(projectId, screenshotIds) {
			const [first, ...rest] = screenshotIds.map((id, position) =>
				db
					.update(projectScreenshots)
					.set({ position })
					.where(and(eq(projectScreenshots.id, id), eq(projectScreenshots.projectId, projectId))),
			);
			if (first) await db.batch([first, ...rest]);
		},
	};
}
