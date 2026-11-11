import { asc, eq, inArray, sql } from 'drizzle-orm';
import type { LibSQLDatabase } from 'drizzle-orm/libsql';
import { skillCategories, skillCategorySkills, skillCategoryTranslations, skills } from '@/app/lib/db/schema';
import type { Locale } from '@/app/lib/i18n/locales';
import { isLocale } from '@/app/lib/i18n/routing';
import type { SkillCategoryRepository } from './skill-category-repository';
import type { CategoryInput, CategoryRecord, CategoryTranslation } from './skill-category';
import { deleteOrphanSkills, resolveSkillIds, type Tx } from './skill-catalog';

async function writeChildren(tx: Tx, categoryId: number, input: CategoryInput) {
	await tx.delete(skillCategoryTranslations).where(eq(skillCategoryTranslations.categoryId, categoryId));
	await tx.delete(skillCategorySkills).where(eq(skillCategorySkills.categoryId, categoryId));
	for (const [locale, t] of Object.entries(input.translations) as [Locale, CategoryTranslation][]) {
		await tx.insert(skillCategoryTranslations).values({ categoryId, locale, name: t.name });
	}
	const skillIds = await resolveSkillIds(tx, input.skills);
	for (const [position, skillId] of skillIds.entries()) {
		await tx.insert(skillCategorySkills).values({ categoryId, skillId, position });
	}
	await deleteOrphanSkills(tx);
}

/** Adapter: SkillCategoryRepository backed by Turso/libSQL through Drizzle. */
export function createTursoSkillCategoryRepository(db: LibSQLDatabase): SkillCategoryRepository {
	async function load(where?: ReturnType<typeof eq>): Promise<CategoryRecord[]> {
		const rows = await db
			.select()
			.from(skillCategories)
			.where(where)
			.orderBy(asc(skillCategories.position), asc(skillCategories.id));
		if (rows.length === 0) return [];
		const ids = rows.map((r) => r.id);
		const [translationRows, skillRows] = await Promise.all([
			db.select().from(skillCategoryTranslations).where(inArray(skillCategoryTranslations.categoryId, ids)),
			db
				.select({ categoryId: skillCategorySkills.categoryId, id: skills.id, name: skills.name })
				.from(skillCategorySkills)
				.innerJoin(skills, eq(skills.id, skillCategorySkills.skillId))
				.where(inArray(skillCategorySkills.categoryId, ids))
				.orderBy(asc(skillCategorySkills.position)),
		]);

		return rows.map((row) => {
			const translations: Partial<Record<Locale, CategoryTranslation>> = {};
			for (const t of translationRows) {
				if (t.categoryId === row.id && isLocale(t.locale)) translations[t.locale] = { name: t.name };
			}
			return {
				id: row.id,
				translations,
				skills: skillRows.filter((s) => s.categoryId === row.id).map((s) => ({ id: s.id, name: s.name })),
			};
		});
	}

	return {
		listCategories: () => load(),

		async getCategory(id) {
			return (await load(eq(skillCategories.id, id)))[0] ?? null;
		},

		async createCategory(input) {
			return db.transaction(async (tx) => {
				const [{ last }] = await tx
					.select({ last: sql<number>`coalesce(max(${skillCategories.position}), -1)` })
					.from(skillCategories);
				const [{ id }] = await tx
					.insert(skillCategories)
					.values({ position: last + 1 })
					.returning({ id: skillCategories.id });
				await writeChildren(tx, id, input);
				return id;
			});
		},

		async updateCategory(id, input) {
			await db.transaction((tx) => writeChildren(tx, id, input));
		},

		async deleteCategory(id) {
			await db.transaction(async (tx) => {
				// Children first: does not rely on SQLite's foreign_keys pragma being on.
				await tx.delete(skillCategorySkills).where(eq(skillCategorySkills.categoryId, id));
				await tx.delete(skillCategoryTranslations).where(eq(skillCategoryTranslations.categoryId, id));
				await tx.delete(skillCategories).where(eq(skillCategories.id, id));
				await deleteOrphanSkills(tx);
			});
		},

		async reorderCategories(ids) {
			const [first, ...rest] = ids.map((id, position) =>
				db.update(skillCategories).set({ position }).where(eq(skillCategories.id, id)),
			);
			if (first) await db.batch([first, ...rest]);
		},

		listSkills: () => db.select().from(skills).orderBy(asc(sql`lower(${skills.name})`)),
	};
}
