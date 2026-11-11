import { unstable_cache } from 'next/cache';
import { getDb } from '@/app/lib/db/client';
import type { Locale } from '@/app/lib/i18n/locales';
import { createTursoHeroRepository } from './turso-hero-repository';
import type { HeroRepository } from './hero-repository';

/** Cache tag shared by every read of hero content; invalidated on admin saves. */
export const HERO_TAG = 'hero';

export function heroRepository(): HeroRepository {
	return createTursoHeroRepository(getDb());
}

/**
 * Public-site read. Cached until an admin save calls updateTag(HERO_TAG),
 * so the database is only hit when content actually changes.
 */
export const getPublishedHero = unstable_cache(
	(locale: Locale) => heroRepository().getHero(locale),
	['hero'],
	{ tags: [HERO_TAG] },
);
