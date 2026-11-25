import { z } from 'zod';
import { LOCALES, type Locale } from '@/app/lib/i18n/locales';
import { parseLinks, type LinkType } from '@/app/lib/content/links';
import type { AreaView } from '@/app/lib/content/areas/area';
import { parseSkillNames } from '@/app/lib/content/skills/skill-category';

/**
 * Per-language copy. `description` (the Overview), `howItWorks`, `results` and
 * `myRole` are Markdown; `keyResult` and `role` are short plain lines. Optional
 * fields are '' when empty.
 */
export type ProjectTranslation = {
	title: string;
	summary: string;
	description: string;
	keyResult: string;
	role: string;
	howItWorks: string;
	results: string;
	myRole: string;
};

/** The only labels a project link can have; each page translates them. */
export const PROJECT_LINK_LABELS = ['live-demo', 'video-demo', 'code', 'api-docs', 'app-store', 'website', 'github-org'] as const;
export type ProjectLinkLabel = (typeof PROJECT_LINK_LABELS)[number];

/** A project link: `type` picks the icon, `label` is a standard label key. */
export type ProjectLink = { type: LinkType; label: ProjectLinkLabel; url: string };

/** Detail page: 'top' = thumbnail row under the main image; 'bottom' = grid at the end. */
export const SCREENSHOTS_POSITIONS = ['top', 'bottom'] as const;
export type ScreenshotsPosition = (typeof SCREENSHOTS_POSITIONS)[number];

/** What the admin saves: the slug is shared by every language (keeps the ES/EN switch working). */
export type ProjectInput = {
	slug: string;
	/** Who the project was for or with (e.g. "UTS"); '' when none. */
	organisation: string;
	year: number | null;
	/** Category (expertise area) id. Required: every project is in exactly one. */
	areaId: number;
	/** Shown on the home page, sorted by featuredOrder. */
	featured: boolean;
	featuredOrder: number;
	screenshotsPosition: ScreenshotsPosition;
	/** Ordered skill names, resolved against the shared catalog (case-insensitive). */
	skills: string[];
	translations: Record<Locale, ProjectTranslation>;
	links: ProjectLink[];
};

/** What the admin form starts from: a new project has no category chosen yet. */
export type ProjectFormValues = Omit<ProjectInput, 'areaId'> & { areaId: number | null };

export const EMPTY_TRANSLATION: ProjectTranslation = {
	title: '',
	summary: '',
	description: '',
	keyResult: '',
	role: '',
	howItWorks: '',
	results: '',
	myRole: '',
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
	organisation: string;
	year: number | null;
	title: string;
	summary: string;
	description: string;
	keyResult: string;
	role: string;
	howItWorks: string;
	results: string;
	myRole: string;
	area: AreaView | null;
	featured: boolean;
	featuredOrder: number;
	screenshotsPosition: ScreenshotsPosition;
	skills: string[];
	links: (ProjectLink & { isExternal: boolean })[];
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

const optional = (max: number) => z.string().trim().max(max, `Max ${max} characters`);
const markdown = optional(20_000);

const TRANSLATED = {
	title: required(120),
	summary: required(300),
	description: markdown,
	keyResult: optional(160),
	role: optional(80),
	howItWorks: markdown,
	results: markdown,
	myRole: markdown,
} as const satisfies Record<keyof ProjectTranslation, z.ZodType<string>>;

export const PROJECT_TRANSLATED_KEYS = Object.keys(TRANSLATED) as (keyof ProjectTranslation)[];
export const projectField = (key: keyof ProjectTranslation, locale: Locale) => `${key}_${locale}`;

const slugSchema = z.string().max(80, 'Max 80 characters').regex(SLUG_PATTERN, 'Use lowercase letters, numbers and dashes');

const ID = z.coerce.number().int().positive();
const YEAR = z.string().regex(/^\d{4}$/).transform(Number).pipe(z.number().int().min(1990).max(2100));
const ORDER = z.string().regex(/^\d+$/).transform(Number).pipe(z.number().int().min(0).max(999));

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

	const organisation = optional(80).safeParse(fields.organisation ?? '');
	if (!organisation.success) errors.organisation = organisation.error.issues[0].message;

	// '' → no year; otherwise a 4-digit year.
	const rawYear = String(fields.year ?? '').trim();
	const year = rawYear === '' ? { success: true as const, data: null } : YEAR.safeParse(rawYear);
	if (!year.success) errors.year = 'Use a year between 1990 and 2100';

	const links = parseProjectLinks(fields.links);
	if (!links.ok) errors.links = links.error;

	const area = ID.safeParse(String(fields.areaId ?? '').trim());
	if (!area.success) errors.areaId = 'Choose a category';

	// Checkbox: present ('on') when checked.
	const featured = fields.featured === 'on' || fields.featured === 'true';
	const rawOrder = String(fields.featuredOrder ?? '').trim();
	const featuredOrder = rawOrder === '' ? { success: true as const, data: 0 } : ORDER.safeParse(rawOrder);
	if (!featuredOrder.success) errors.featuredOrder = 'Use a whole number from 0';

	const screenshotsPosition = z.enum(SCREENSHOTS_POSITIONS).safeParse(fields.screenshotsPosition ?? 'bottom');
	if (!screenshotsPosition.success) errors.screenshotsPosition = 'Choose top or bottom';

	const skills = parseSkillNames(fields.skills);
	if (!skills.ok) errors.skills = skills.error;

	if (
		Object.keys(errors).length > 0 ||
		!organisation.success || !year.success || !links.ok || !area.success || !featuredOrder.success ||
		!screenshotsPosition.success || !skills.ok
	) {
		return { ok: false, errors };
	}
	return {
		ok: true,
		value: {
			slug,
			organisation: organisation.data,
			year: year.data,
			areaId: area.data,
			featured,
			featuredOrder: featuredOrder.data,
			screenshotsPosition: screenshotsPosition.data,
			skills: skills.skills,
			translations,
			links: links.links,
		},
	};
}

/** Project links: the shared link rules (type, http(s)/mailto URL) plus a standard label. */
export function parseProjectLinks(raw: unknown): { ok: true; links: ProjectLink[] } | { ok: false; error: string } {
	const parsed = parseLinks(raw);
	if (!parsed.ok) return parsed;
	const invalid = parsed.links.find((l) => !isProjectLinkLabel(l.label));
	if (invalid) return { ok: false, error: `Unknown link label: ${invalid.label}` };
	return { ok: true, links: parsed.links as ProjectLink[] };
}

export function isProjectLinkLabel(label: string): label is ProjectLinkLabel {
	return (PROJECT_LINK_LABELS as readonly string[]).includes(label);
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
		organisation: record.organisation,
		year: record.year,
		...t,
		area: areas.find((a) => a.id === record.areaId) ?? null,
		featured: record.featured,
		featuredOrder: record.featuredOrder,
		screenshotsPosition: record.screenshotsPosition,
		skills: record.skills,
		links: record.links.map((l) => ({ ...l, isExternal: l.type !== 'email' })),
		imageUrl: record.imageKey ? publicUrl(record.imageKey) : null,
		screenshots: record.screenshots.map((s) => publicUrl(s.key)),
	};
}
