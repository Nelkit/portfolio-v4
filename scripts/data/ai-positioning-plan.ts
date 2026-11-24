/**
 * Data for the "AI Product Engineer" repositioning (pure, unit tested).
 * Applied by ai-positioning.ts. Every value here was confirmed by the owner;
 * nothing is inferred.
 */
import { isProjectLinkLabel, type ProjectLinkLabel, type ProjectTranslation } from '@/app/lib/content/projects/project';
import type { Locale } from '@/app/lib/i18n/locales';

// ---------- Categories ----------

export type AreaKey = 'ai-products' | 'ml-foundations' | 'data-storytelling' | 'gis-web' | 'mobile';

/**
 * Final categories in display order. `from` lists the current English names
 * this category replaces (rename keeps the id); none → created.
 */
export const AREA_PLAN: { key: AreaKey; en: string; es: string; from: string[] }[] = [
	{ key: 'ai-products', en: 'AI Products', es: 'Productos de IA', from: ['AI & Data Science'] },
	{ key: 'ml-foundations', en: 'ML Foundations', es: 'Fundamentos de ML', from: ['Full-Stack Dev'] },
	{ key: 'data-storytelling', en: 'Data Storytelling', es: 'Storytelling con datos', from: [] },
	{ key: 'gis-web', en: 'GIS & Web', es: 'SIG y web', from: [] },
	{ key: 'mobile', en: 'Mobile', es: 'Móvil', from: ['Mobile Innovation'] },
];

// ---------- Projects ----------

export type ProjectPlan = {
	area: AreaKey;
	year: number;
	organisation: string;
	/** Position on the home page (1 first); undefined = not featured. */
	featuredOrder?: number;
	addSkills?: string[];
	removeSkills?: string[];
	/** Move the H2 sections of the description into their own fields. */
	splitSections?: boolean;
};

export const PROJECT_PLAN: Record<string, ProjectPlan> = {
	'horus-cctv-video-search': { area: 'ai-products', year: 2026, organisation: 'UTS', featuredOrder: 1, splitSections: true },
	'sydney-liveability-ai': { area: 'ai-products', year: 2026, organisation: 'UTS', featuredOrder: 2 },
	'agromapas-cartographic-viewer': {
		area: 'gis-web',
		year: 2022,
		organisation: 'Secretaría de Agricultura y Ganadería',
		featuredOrder: 3,
		addSkills: ['PostgreSQL', 'PostGIS', 'AWS'],
	},
	'ryte-2-0': { area: 'mobile', year: 2021, organisation: 'Ryte', featuredOrder: 4 },
	'crypto-price-prediction-dashboard': { area: 'ai-products', year: 2025, organisation: 'UTS', featuredOrder: 5 },
	'australia-liveability-gap': { area: 'data-storytelling', year: 2026, organisation: 'UTS', featuredOrder: 6 },
	'sydney-rain-prediction-api': { area: 'ai-products', year: 2025, organisation: 'UTS' },
	'image-captioning-with-cnn-lstm': { area: 'ml-foundations', year: 2026, organisation: 'UTS' },
	'food101-transfer-learning': { area: 'ml-foundations', year: 2026, organisation: 'UTS' },
	'neural-networks-from-scratch': { area: 'ml-foundations', year: 2026, organisation: 'UTS' },
	'nlp-text-analysis-narrative': { area: 'ml-foundations', year: 2026, organisation: 'UTS', addSkills: ['spaCy', 'Gensim', 'VADER'] },
	'classroom-locstatt': { area: 'mobile', year: 2019, organisation: 'Locstatt' },
	// The request asked to remove SwiftUI here, but this project never had it (it is a UIKit library).
	'nkalert-pod-library': { area: 'mobile', year: 2019, organisation: 'Personal', removeSkills: ['SwiftUI'] },
};

// ---------- Link labels ----------

/** Current free-text labels (lowercase) → standard label. */
const LINK_LABELS: Record<string, ProjectLinkLabel> = {
	'live demo': 'live-demo',
	'api docs': 'api-docs',
	'code (github org)': 'github-org',
	'code (frontend)': 'code',
	repo: 'code',
	'github repo': 'code',
	code: 'code',
	'project website': 'website',
	website: 'website',
	'app in appstore': 'app-store',
	'app store': 'app-store',
	'cocoapods pod': 'website',
};

/** Standard label for a stored label, or null when unknown (the script then stops). */
export function linkLabelFor(label: string): ProjectLinkLabel | null {
	if (isProjectLinkLabel(label)) return label;
	return LINK_LABELS[label.trim().toLowerCase()] ?? null;
}

// ---------- Skills ----------

/** Skill names to normalise everywhere (lowercase key). */
const SKILL_RENAMES: Record<string, string> = { nextjs: 'Next.js', reactjs: 'React', github: 'GitHub' };

/** Renames, removes and appends skills; keeps order and drops case-insensitive duplicates. */
export function normaliseSkills(skills: string[], add: string[] = [], remove: string[] = []): string[] {
	const removed = new Set(remove.map((s) => s.toLowerCase()));
	const out: string[] = [];
	const seen = new Set<string>();
	for (const raw of [...skills, ...add]) {
		const name = SKILL_RENAMES[raw.toLowerCase()] ?? raw;
		const key = name.toLowerCase();
		if (seen.has(key) || removed.has(key)) continue;
		seen.add(key);
		out.push(name);
	}
	return out;
}

// ---------- Detail sections ----------

type SectionKey = 'howItWorks' | 'results' | 'myRole';

/** H2 titles used in the descriptions (Horus), per language. */
const HEADINGS: Record<Locale, Record<SectionKey, string>> = {
	en: { howItWorks: 'How it works', results: 'Results', myRole: 'My role' },
	es: { howItWorks: 'Cómo funciona', results: 'Resultados', myRole: 'Mi rol' },
};

export type SplitSections = Pick<ProjectTranslation, 'description' | 'howItWorks' | 'results' | 'myRole' | 'role'>;

/**
 * Splits a description with "## How it works / ## Results / ## My role: X"
 * into fields, moving the text verbatim. Returns null when there is no known
 * H2 or when there is an unknown one (never drops text).
 */
export function splitSections(markdown: string, locale: Locale): SplitSections | null {
	const parts = markdown.split(/^## (.+)$/m); // [intro, heading1, body1, heading2, body2, …]
	if (parts.length < 3) return null;

	const result: SplitSections = { description: parts[0].trim(), howItWorks: '', results: '', myRole: '', role: '' };
	for (let i = 1; i < parts.length; i += 2) {
		const heading = parts[i].trim();
		const body = (parts[i + 1] ?? '').trim();
		const key = (Object.keys(HEADINGS[locale]) as SectionKey[]).find(
			(k) => heading === HEADINGS[locale][k] || heading.startsWith(`${HEADINGS[locale][k]}:`),
		);
		if (!key) return null;
		result[key] = body;
		if (key === 'myRole') result.role = heading.slice(HEADINGS[locale].myRole.length).replace(/^:/, '').trim();
	}
	return result;
}
