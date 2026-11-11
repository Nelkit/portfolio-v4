import { z } from 'zod';
import { LOCALES, type Locale } from '@/app/lib/i18n/locales';
import { parseLinks, type Link } from '@/app/lib/content/links';
import type { AreaView } from '@/app/lib/content/areas/area';

/** Per-language copy. `description` is Markdown. */
export type ProjectTranslation = { title: string; summary: string; description: string };

/** What the admin saves: the slug is shared by every language (keeps the ES/EN switch working). */
export type ProjectInput = {
	slug: string;
	company: string;
	/** Expertise area id, or null for none. */
	areaId: number | null;
	translations: Record<Locale, ProjectTranslation>;
	links: Link[];
};

export const MAX_SCREENSHOTS = 12;

export type Screenshot = { id: number; key: string };

/** What is stored, as read back. Images are storage keys, managed separately from the text. */
export type ProjectRecord = Omit<ProjectInput, 'translations'> & {
	id: number;
	translations: Partial<Record<Locale, ProjectTranslation>>;
	imageKey: string | null;
	screenshots: Screenshot[];
};

/** What the public site renders for one language. */
export type ProjectView = {
	slug: string;
	company: string;
	title: string;
	summary: string;
	description: string;
	area: AreaView | null;
	links: (Link & { isExternal: boolean })[];
	imageUrl: string | null;
	/** Screenshot URLs, in display order. */
	screenshots: string[];
};

// ---------- Slugs ----------

export const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/** 'Mi Aplicación Móvil' → 'mi-aplicacion-movil' */
export function slugify(text: string): string {
	return text
		.normalize('NFD')
		.replace(/[̀-ͯ]/g, '')
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '')
		.slice(0, 80)
		.replace(/-+$/g, '');
}

// ---------- Admin form parsing ----------

const required = (max: number) => z.string().trim().min(1, 'Required').max(max, `Max ${max} characters`);

const TRANSLATED = {
	title: required(120),
	summary: required(300),
	description: z.string().trim().max(20_000, 'Max 20000 characters'),
} as const;

export const PROJECT_TRANSLATED_KEYS = Object.keys(TRANSLATED) as (keyof ProjectTranslation)[];
export const projectField = (key: keyof ProjectTranslation, locale: Locale) => `${key}_${locale}`;

const slugSchema = z.string().max(80, 'Max 80 characters').regex(SLUG_PATTERN, 'Use lowercase letters, numbers and dashes');

export type ProjectFormResult =
	| { ok: true; value: ProjectInput }
	| { ok: false; errors: Record<string, string> };

export function parseProjectForm(fields: Record<string, unknown>): ProjectFormResult {
	const errors: Record<string, string> = {};

	const translations = {} as Record<Locale, ProjectTranslation>;
	for (const locale of LOCALES) {
		const values = {} as ProjectTranslation;
		for (const key of PROJECT_TRANSLATED_KEYS) {
			const name = projectField(key, locale);
			const result = TRANSLATED[key].safeParse(fields[name] ?? '');
			if (result.success) values[key] = result.data;
			else errors[name] = result.error.issues[0].message;
		}
		translations[locale] = values;
	}

	// Empty slug → derived from the English title.
	const rawSlug = String(fields.slug ?? '').trim();
	const slug = rawSlug || slugify(translations.en?.title ?? '');
	const slugResult = slugSchema.safeParse(slug);
	if (!slugResult.success && !errors.title_en) errors.slug = slugResult.error.issues[0].message;

	const company = z.string().trim().max(80, 'Max 80 characters').safeParse(fields.company ?? '');
	if (!company.success) errors.company = company.error.issues[0].message;

	const links = parseLinks(fields.links);
	if (!links.ok) errors.links = links.error;

	// '' (no area selected) → null; otherwise a positive integer id.
	const rawArea = String(fields.areaId ?? '').trim();
	const area = rawArea === '' ? { success: true as const, data: null } : z.coerce.number().int().positive().safeParse(rawArea);
	if (!area.success) errors.areaId = 'Invalid area';

	if (Object.keys(errors).length > 0 || !company.success || !links.ok || !area.success) return { ok: false, errors };
	return {
		ok: true,
		value: { slug, company: company.data, areaId: area.data, translations, links: links.links },
	};
}

// ---------- Public view ----------

export function toProjectView(
	record: ProjectRecord,
	locale: Locale,
	publicUrl: (key: string) => string,
	/** Areas already resolved for this locale; an unknown id shows as no area. */
	areas: AreaView[] = [],
): ProjectView | null {
	const t = record.translations[locale] ?? LOCALES.map((l) => record.translations[l]).find(Boolean);
	if (!t) return null;
	return {
		slug: record.slug,
		company: record.company,
		title: t.title,
		summary: t.summary,
		description: t.description,
		area: areas.find((a) => a.id === record.areaId) ?? null,
		links: record.links.map((l) => ({ ...l, isExternal: l.type !== 'email' })),
		imageUrl: record.imageKey ? publicUrl(record.imageKey) : null,
		screenshots: record.screenshots.map((s) => publicUrl(s.key)),
	};
}
