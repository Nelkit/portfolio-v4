import { eq, sql } from 'drizzle-orm';
import type { LibSQLDatabase } from 'drizzle-orm/libsql';
import { heroTranslations } from '@/app/lib/db/schema';
import type { Locale } from '@/app/lib/i18n/locales';
import type { HeroRepository } from './hero-repository';

/** Adapter: HeroRepository backed by Turso/libSQL through Drizzle. */
export function createTursoHeroRepository(db: LibSQLDatabase): HeroRepository {
	const upsert = (locale: Locale, headline: string) =>
		db
			.insert(heroTranslations)
			.values({ locale, headline })
			.onConflictDoUpdate({
				target: heroTranslations.locale,
				set: { headline, updatedAt: sql`(unixepoch())` },
			});

	return {
		async getHero(locale) {
			const rows = await db
				.select({ locale: heroTranslations.locale, headline: heroTranslations.headline })
				.from(heroTranslations)
				.where(eq(heroTranslations.locale, locale))
				.limit(1);
			const row = rows[0];
			return row ? { locale: row.locale as Locale, headline: row.headline } : null;
		},

		async saveHeadline(locale, headline) {
			await upsert(locale, headline);
		},

		async saveHeadlines(headlines) {
			const statements = (Object.entries(headlines) as [Locale, string][]).map(
				([locale, headline]) => upsert(locale, headline),
			);
			const [first, ...rest] = statements;
			if (!first) return;
			// db.batch runs every statement in ONE transaction (one round trip to Turso).
			await db.batch([first, ...rest]);
		},
	};
}
