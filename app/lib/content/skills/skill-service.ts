import { unstable_cache } from 'next/cache';
import { getDb } from '@/app/lib/db/client';
import type { Locale } from '@/app/lib/i18n/locales';
import { toCategoryView, type CategoryView } from './skill-category';
import { createTursoSkillCategoryRepository } from './turso-skill-category-repository';
import type { SkillCategoryRepository } from './skill-category-repository';

/** Cache tag for every public read of the tech stack; invalidated on admin changes. */
export const SKILLS_TAG = 'skills';

export function skillCategoryRepository(): SkillCategoryRepository {
	return createTursoSkillCategoryRepository(getDb());
}

export const getPublishedSkillCategories = unstable_cache(
	async (locale: Locale): Promise<CategoryView[]> =>
		(await skillCategoryRepository().listCategories())
			.map((record) => toCategoryView(record, locale))
			.filter((view): view is CategoryView => view !== null),
	['skill-categories'],
	{ tags: [SKILLS_TAG] },
);
