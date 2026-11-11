import { sql } from 'drizzle-orm';
import { check, integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

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

const updatedAt = () =>
	integer('updated_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`);

/** Single-row table (id is always 1): language-independent profile data. */
export const profile = sqliteTable(
	'profile',
	{
		id: integer('id').primaryKey(),
		name: text('name').notNull(),
		/** Storage key of the avatar image, not a URL. */
		avatarKey: text('avatar_key'),
		updatedAt: updatedAt(),
	},
	(table) => [check('profile_singleton', sql`${table.id} = 1`)],
);

/** Profile copy per locale (hero role/intro, CV file and contact section). */
export const profileTranslations = sqliteTable('profile_translations', {
	locale: text('locale').primaryKey(),
	role: text('role').notNull(),
	intro: text('intro').notNull(),
	/** Storage key of this language's CV (PDF). */
	cvKey: text('cv_key'),
	contactAvailable: text('contact_available').notNull(),
	contactHeadline: text('contact_headline').notNull(),
	contactDescription: text('contact_description').notNull(),
	updatedAt: updatedAt(),
});

/** One ordered list of links, shared by the sidebar, footer and contact section. */
export const socialLinks = sqliteTable('social_links', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	type: text('type').notNull(),
	label: text('label').notNull(),
	url: text('url').notNull(),
	position: integer('position').notNull(),
});
