import { sql } from 'drizzle-orm';
import { check, integer, primaryKey, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core';

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

/** Projects. The slug is shared by every language so the ES/EN switch keeps the URL. */
export const projects = sqliteTable('projects', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	slug: text('slug').notNull().unique(),
	company: text('company').notNull().default(''),
	/** Storage key of the main image (cover), not a URL. */
	imageKey: text('image_key'),
	/** Expertise area (one per project, optional). */
	areaId: integer('area_id').references(() => expertiseAreas.id, { onDelete: 'set null' }),
	position: integer('position').notNull(),
	createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
	updatedAt: updatedAt(),
});

/** Project copy per locale; `description` is Markdown. */
export const projectTranslations = sqliteTable(
	'project_translations',
	{
		projectId: integer('project_id').notNull().references(() => projects.id, { onDelete: 'cascade' }),
		locale: text('locale').notNull(),
		title: text('title').notNull(),
		summary: text('summary').notNull(),
		description: text('description').notNull().default(''),
	},
	(table) => [primaryKey({ columns: [table.projectId, table.locale] })],
);

/** Ordered links of a project (code, demo, store…). */
export const projectLinks = sqliteTable('project_links', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	projectId: integer('project_id').notNull().references(() => projects.id, { onDelete: 'cascade' }),
	type: text('type').notNull(),
	label: text('label').notNull(),
	url: text('url').notNull(),
	position: integer('position').notNull(),
});

/** Ordered screenshots of a project (storage keys). */
export const projectScreenshots = sqliteTable('project_screenshots', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	projectId: integer('project_id').notNull().references(() => projects.id, { onDelete: 'cascade' }),
	key: text('key').notNull(),
	position: integer('position').notNull(),
});

/** Expertise areas used to group and filter projects (ordered). */
export const expertiseAreas = sqliteTable('expertise_areas', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	position: integer('position').notNull(),
});

/** Area name per locale. */
export const expertiseAreaTranslations = sqliteTable(
	'expertise_area_translations',
	{
		areaId: integer('area_id').notNull().references(() => expertiseAreas.id, { onDelete: 'cascade' }),
		locale: text('locale').notNull(),
		name: text('name').notNull(),
	},
	(table) => [primaryKey({ columns: [table.areaId, table.locale] })],
);

/** Skill catalog (technologies). One name, unique ignoring case; shared by categories and projects. */
export const skills = sqliteTable(
	'skills',
	{
		id: integer('id').primaryKey({ autoIncrement: true }),
		name: text('name').notNull(),
	},
	(table) => [uniqueIndex('skills_name_nocase').on(sql`lower(${table.name})`)],
);

/** Tech-stack categories (tabs), ordered. */
export const skillCategories = sqliteTable('skill_categories', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	position: integer('position').notNull(),
});

/** Category name per locale. */
export const skillCategoryTranslations = sqliteTable(
	'skill_category_translations',
	{
		categoryId: integer('category_id').notNull().references(() => skillCategories.id, { onDelete: 'cascade' }),
		locale: text('locale').notNull(),
		name: text('name').notNull(),
	},
	(table) => [primaryKey({ columns: [table.categoryId, table.locale] })],
);

/** Many-to-many: a skill can be in several categories; ordered within each category. */
export const skillCategorySkills = sqliteTable(
	'skill_category_skills',
	{
		categoryId: integer('category_id').notNull().references(() => skillCategories.id, { onDelete: 'cascade' }),
		skillId: integer('skill_id').notNull().references(() => skills.id, { onDelete: 'cascade' }),
		position: integer('position').notNull(),
	},
	(table) => [primaryKey({ columns: [table.categoryId, table.skillId] })],
);

/** Many-to-many: skills (technologies) used by a project, ordered. */
export const projectSkills = sqliteTable(
	'project_skills',
	{
		projectId: integer('project_id').notNull().references(() => projects.id, { onDelete: 'cascade' }),
		skillId: integer('skill_id').notNull().references(() => skills.id, { onDelete: 'cascade' }),
		position: integer('position').notNull(),
	},
	(table) => [primaryKey({ columns: [table.projectId, table.skillId] })],
);

/** Career timeline entries. No end date = current role. Ordered by date (not manually). */
export const careerEntries = sqliteTable('career_entries', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	startYear: integer('start_year').notNull(),
	startMonth: integer('start_month').notNull(),
	endYear: integer('end_year'),
	endMonth: integer('end_month'),
});

/** Role title and detail per locale. */
export const careerEntryTranslations = sqliteTable(
	'career_entry_translations',
	{
		entryId: integer('entry_id').notNull().references(() => careerEntries.id, { onDelete: 'cascade' }),
		locale: text('locale').notNull(),
		title: text('title').notNull(),
		detail: text('detail').notNull().default(''),
	},
	(table) => [primaryKey({ columns: [table.entryId, table.locale] })],
);

/** Education entries. `inProgress` is explicit: an ongoing degree may have an expected end date. */
export const educationEntries = sqliteTable('education_entries', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	startYear: integer('start_year').notNull(),
	startMonth: integer('start_month').notNull(),
	endYear: integer('end_year'),
	endMonth: integer('end_month'),
	inProgress: integer('in_progress', { mode: 'boolean' }).notNull().default(false),
});

/** Degree, institution and description per locale. */
export const educationEntryTranslations = sqliteTable(
	'education_entry_translations',
	{
		entryId: integer('entry_id').notNull().references(() => educationEntries.id, { onDelete: 'cascade' }),
		locale: text('locale').notNull(),
		degree: text('degree').notNull(),
		institution: text('institution').notNull(),
		description: text('description').notNull().default(''),
	},
	(table) => [primaryKey({ columns: [table.entryId, table.locale] })],
);
