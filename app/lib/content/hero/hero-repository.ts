import type { Locale } from '@/app/lib/i18n/locales';
import type { Hero } from './hero';

/**
 * Port: what the app needs from storage, independent of the database.
 * Implementations must THROW on infrastructure errors (never return an empty
 * result), so Next.js keeps serving the last good cached page.
 */
export interface HeroRepository {
	getHero(locale: Locale): Promise<Hero | null>;
	saveHeadline(locale: Locale, headline: string): Promise<void>;
	/** Saves several locales atomically: all succeed or none do. */
	saveHeadlines(headlines: Partial<Record<Locale, string>>): Promise<void>;
}
