import { unstable_cache } from 'next/cache';
import { getDb } from '@/app/lib/db/client';
import type { Locale } from '@/app/lib/i18n/locales';
import { toAreaView, type AreaView } from './area';
import { createTursoAreaRepository } from './turso-area-repository';
import type { AreaRepository } from './area-repository';

/** Cache tag for every public read that shows area names (areas AND projects). */
export const AREAS_TAG = 'areas';

export function areaRepository(): AreaRepository {
	return createTursoAreaRepository(getDb());
}

/** Uncached: areas for one locale, in display order. */
export async function loadAreaViews(locale: Locale): Promise<AreaView[]> {
	return (await areaRepository().listAreas())
		.map((record) => toAreaView(record, locale))
		.filter((view): view is AreaView => view !== null);
}

export const getPublishedAreas = unstable_cache(loadAreaViews, ['areas'], { tags: [AREAS_TAG] });
