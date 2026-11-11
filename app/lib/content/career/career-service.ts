import { unstable_cache } from 'next/cache';
import { getDb } from '@/app/lib/db/client';
import type { Locale } from '@/app/lib/i18n/locales';
import { getDictionary } from '@/app/lib/i18n/dictionaries';
import { toCareerView, type CareerView, type YearMonth } from './career';
import { createTursoCareerRepository } from './turso-career-repository';
import type { CareerRepository } from './career-repository';

/** Cache tag for every public read of the career timeline. */
export const CAREER_TAG = 'career';

export function careerRepository(): CareerRepository {
	return createTursoCareerRepository(getDb());
}

/**
 * Entries for one language + the earliest start. Years of experience depend on
 * TODAY, so they are computed at render time (careerYears), not cached here.
 */
export const getPublishedCareer = unstable_cache(
	async (locale: Locale): Promise<{ entries: CareerView[]; since: YearMonth | null }> => {
		const { meta, sections } = getDictionary(locale);
		const records = await careerRepository().listEntries();
		const entries = records
			.map((r) => toCareerView(r, locale, meta.dateLocale, sections.career.present))
			.filter((v): v is CareerView => v !== null);
		const since = records.reduce<YearMonth | null>(
			(earliest, r) =>
				!earliest || r.start.year * 12 + r.start.month < earliest.year * 12 + earliest.month ? r.start : earliest,
			null,
		);
		return { entries, since };
	},
	['career'],
	{ tags: [CAREER_TAG] },
);
