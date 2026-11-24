/**
 * Pure logic for import-projects.ts (unit tested): pairs the EN and ES JSON
 * entries by slug, and turns them into a ProjectInput that overwrites only the
 * fields the JSON has. The result goes through the admin form rules
 * (parseProjectForm), so the import accepts exactly what the admin accepts.
 */
import {
	EMPTY_TRANSLATION,
	isProjectLinkLabel,
	parseProjectForm,
	PROJECT_TRANSLATED_KEYS,
	projectField,
	type ProjectInput,
	type ProjectLinkLabel,
	type ProjectRecord,
	type ProjectTranslation,
} from '@/app/lib/content/projects/project';
import type { AreaRecord } from '@/app/lib/content/areas/area';
import { LOCALES, type Locale } from '@/app/lib/i18n/locales';

/** One project in projects-<locale>.json. Every field but the slug is optional. */
export type ProjectEntry = {
	slug: string;
	/** Category name (English or Spanish), matched against the existing categories. */
	category?: string;
	organisation?: string;
	year?: number | null;
	featured?: boolean;
	featuredOrder?: number | null;
	techStack?: string[];
	/** `label` is the display text ("Live demo") or the key ("live-demo"). */
	links?: { type: string; label: string; url: string }[];
	title?: string;
	summary?: string;
	keyResult?: string;
	role?: string;
	/** Stored as `description`. */
	overview?: string;
	howItWorks?: string;
	results?: string;
	myRole?: string;
};

/** Fields shared by both languages: they must match between the two files. */
const SHARED_KEYS = ['category', 'organisation', 'year', 'featured', 'featuredOrder', 'techStack', 'links'] as const;

/** JSON key of each translated field. */
const JSON_KEY: Record<keyof ProjectTranslation, keyof ProjectEntry> = {
	title: 'title',
	summary: 'summary',
	description: 'overview',
	keyResult: 'keyResult',
	role: 'role',
	howItWorks: 'howItWorks',
	results: 'results',
	myRole: 'myRole',
};

export type ProjectPair = { slug: string } & Record<Locale, ProjectEntry>;

// ---------- Links ----------

/** "Live demo" / "GitHub org" / "live-demo" → standard key; null when not standard. */
export function linkLabelKey(label: string): ProjectLinkLabel | null {
	const key = label.trim().toLowerCase().replace(/\s+/g, '-');
	return isProjectLinkLabel(key) ? key : null;
}

// ---------- Pairing ----------

export function pairEntries(en: ProjectEntry[], es: ProjectEntry[]): { pairs: ProjectPair[]; problems: string[] } {
	const problems: string[] = [];
	const files = { en, es } as Record<Locale, ProjectEntry[]>;
	const bySlug = {} as Record<Locale, Map<string, ProjectEntry>>;
	for (const locale of LOCALES) {
		bySlug[locale] = new Map();
		for (const item of files[locale]) {
			if (bySlug[locale].has(item.slug)) problems.push(`"${item.slug}" appears more than once in projects-${locale}.json`);
			bySlug[locale].set(item.slug, item);
		}
	}

	const pairs: ProjectPair[] = [];
	for (const [slug, enEntry] of bySlug.en) {
		const esEntry = bySlug.es.get(slug);
		if (!esEntry) {
			problems.push(`"${slug}" is in projects-en.json but not in projects-es.json`);
			continue;
		}
		for (const key of SHARED_KEYS) {
			if (JSON.stringify(enEntry[key]) !== JSON.stringify(esEntry[key])) {
				problems.push(`"${slug}": "${key}" differs between the EN and ES files`);
			}
		}
		pairs.push({ slug, en: enEntry, es: esEntry });
	}
	for (const slug of bySlug.es.keys()) {
		if (!bySlug.en.has(slug)) problems.push(`"${slug}" is in projects-es.json but not in projects-en.json`);
	}
	return { pairs, problems };
}

// ---------- Categories ----------

/** The category whose English or Spanish name matches (case-insensitive). */
export function findArea(areas: AreaRecord[], name: string): AreaRecord | undefined {
	const wanted = name.trim().toLowerCase();
	return areas.find((a) => LOCALES.some((l) => a.translations[l]?.name.trim().toLowerCase() === wanted));
}

// ---------- Project input ----------

export type BuildResult = { ok: true; value: ProjectInput } | { ok: false; errors: Record<string, string> };

/**
 * The JSON values win; whatever the JSON leaves out keeps its current value
 * (or the empty default for a new project). Images are not touched.
 */
export function buildProjectInput(existing: ProjectRecord | null, pair: ProjectPair, areaId: number | null): BuildResult {
	const shared = pair.en;
	const pick = <T>(value: T | undefined, current: T): T => (value === undefined ? current : value);

	const year = pick(shared.year, existing?.year ?? null);
	const featured = pick(shared.featured, existing?.featured ?? false);
	const featuredOrder = pick(shared.featuredOrder, existing?.featuredOrder ?? 0) ?? 0;
	const links = shared.links
		? shared.links.map((l) => ({ ...l, label: linkLabelKey(l.label) ?? l.label }))
		: (existing?.links ?? []);

	const fields: Record<string, unknown> = {
		slug: pair.slug,
		organisation: pick(shared.organisation, existing?.organisation ?? ''),
		year: year === null ? '' : String(year),
		areaId: areaId === null ? '' : String(areaId),
		featured: featured ? 'on' : '',
		featuredOrder: String(featuredOrder),
		skills: JSON.stringify(pick(shared.techStack, existing?.skills ?? [])),
		links: JSON.stringify(links),
	};
	for (const locale of LOCALES) {
		const current = { ...EMPTY_TRANSLATION, ...existing?.translations[locale] };
		for (const key of PROJECT_TRANSLATED_KEYS) {
			const value = pair[locale][JSON_KEY[key]] as string | undefined;
			fields[projectField(key, locale)] = value ?? current[key];
		}
	}

	return parseProjectForm(fields);
}
