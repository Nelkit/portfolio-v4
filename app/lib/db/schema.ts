import { sql } from 'drizzle-orm';
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

/**
 * Translatable hero copy — one row per locale.
 * Bilingual from day one (es/en is an expensive-to-change decision):
 * translatable fields live in *_translations tables keyed by locale.
 */
export const heroTranslations = sqliteTable('hero_translations', {
	locale: text('locale').primaryKey(),
	headline: text('headline').notNull(),
	updatedAt: integer('updated_at', { mode: 'timestamp' })
		.notNull()
		.default(sql`(unixepoch())`),
});
