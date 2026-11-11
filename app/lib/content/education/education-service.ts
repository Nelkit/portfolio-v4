import { unstable_cache } from 'next/cache';
import { getDb } from '@/app/lib/db/client';
import type { Locale } from '@/app/lib/i18n/locales';
import { getDictionary } from '@/app/lib/i18n/dictionaries';
import { toEducationView, type EducationView } from './education';
import { createTursoEducationRepository } from './turso-education-repository';
import type { EducationRepository } from './education-repository';

/** Cache tag for every public read of education entries. */
export const EDUCATION_TAG = 'education';

export function educationRepository(): EducationRepository {
	return createTursoEducationRepository(getDb());
}

export const getPublishedEducation = unstable_cache(
	async (locale: Locale): Promise<EducationView[]> => {
		const { meta, sections } = getDictionary(locale);
		return (await educationRepository().listEntries())
			.map((r) => toEducationView(r, locale, meta.dateLocale, sections.career.present))
			.filter((v): v is EducationView => v !== null);
	},
	['education'],
	{ tags: [EDUCATION_TAG] },
);
