import { asc, eq, sql } from 'drizzle-orm';
import type { LibSQLDatabase } from 'drizzle-orm/libsql';
import { expertiseAreas, expertiseAreaTranslations, projects } from '@/app/lib/db/schema';
import type { Locale } from '@/app/lib/i18n/locales';
import { isLocale } from '@/app/lib/i18n/routing';
import type { AreaRepository } from './area-repository';
import type { AreaInput, AreaRecord, AreaTranslation } from './area';

/** Adapter: AreaRepository backed by Turso/libSQL through Drizzle. */
export function createTursoAreaRepository(db: LibSQLDatabase): AreaRepository {
	async function load(where?: ReturnType<typeof eq>): Promise<AreaRecord[]> {
		const rows = await db.select().from(expertiseAreas).where(where).orderBy(asc(expertiseAreas.position), asc(expertiseAreas.id));
		if (rows.length === 0) return [];
		const translationRows = await db.select().from(expertiseAreaTranslations);
		return rows.map((row) => {
			const translations: Partial<Record<Locale, AreaTranslation>> = {};
			for (const t of translationRows) {
				if (t.areaId === row.id && isLocale(t.locale)) translations[t.locale] = { name: t.name };
			}
			return { id: row.id, translations };
		});
	}

	const translationInserts = (areaId: number, input: AreaInput) =>
		(Object.entries(input.translations) as [Locale, AreaTranslation][]).map(([locale, t]) =>
			db.insert(expertiseAreaTranslations).values({ areaId, locale, name: t.name }),
		);

	return {
		listAreas: () => load(),

		async getArea(id) {
			return (await load(eq(expertiseAreas.id, id)))[0] ?? null;
		},

		async createArea(input) {
			return db.transaction(async (tx) => {
				const [{ last }] = await tx
					.select({ last: sql<number>`coalesce(max(${expertiseAreas.position}), -1)` })
					.from(expertiseAreas);
				const [{ id }] = await tx
					.insert(expertiseAreas)
					.values({ position: last + 1 })
					.returning({ id: expertiseAreas.id });
				for (const [locale, t] of Object.entries(input.translations) as [Locale, AreaTranslation][]) {
					await tx.insert(expertiseAreaTranslations).values({ areaId: id, locale, name: t.name });
				}
				return id;
			});
		},

		async updateArea(id, input) {
			const [first, ...rest] = translationInserts(id, input);
			await db.batch([
				db.delete(expertiseAreaTranslations).where(eq(expertiseAreaTranslations.areaId, id)),
				...(first ? [first, ...rest] : []),
			]);
		},

		async deleteArea(id) {
			// Checked explicitly instead of relying on SQLite's foreign_keys pragma.
			return db.transaction(async (tx) => {
				const [{ count }] = await tx
					.select({ count: sql<number>`count(*)` })
					.from(projects)
					.where(eq(projects.areaId, id));
				if (count > 0) return { deleted: false, projects: count };
				await tx.delete(expertiseAreaTranslations).where(eq(expertiseAreaTranslations.areaId, id));
				await tx.delete(expertiseAreas).where(eq(expertiseAreas.id, id));
				return { deleted: true, projects: 0 };
			});
		},

		async reorderAreas(ids) {
			const [first, ...rest] = ids.map((id, position) =>
				db.update(expertiseAreas).set({ position }).where(eq(expertiseAreas.id, id)),
			);
			if (first) await db.batch([first, ...rest]);
		},
	};
}
