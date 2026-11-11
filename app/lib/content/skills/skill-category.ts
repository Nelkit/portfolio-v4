import { z } from 'zod';
import { LOCALES, type Locale } from '@/app/lib/i18n/locales';

export type CategoryTranslation = { name: string };
/** What the admin saves: bilingual name + ordered skill names (resolved against the catalog). */
export type CategoryInput = { translations: Record<Locale, CategoryTranslation>; skills: string[] };
export type Skill = { id: number; name: string };
export type CategoryRecord = { id: number; translations: Partial<Record<Locale, CategoryTranslation>>; skills: Skill[] };
/** What the public site renders for one language. */
export type CategoryView = { id: number; name: string; skills: string[] };

export const MAX_SKILLS_PER_CATEGORY = 60;
export const categoryField = (locale: Locale) => `name_${locale}`;

const nameSchema = z.string().trim().min(1, 'Required').max(40, 'Max 40 characters');
const skillsSchema = z
	.array(z.string().trim().max(40, 'Each skill: max 40 characters'))
	.max(MAX_SKILLS_PER_CATEGORY, `Max ${MAX_SKILLS_PER_CATEGORY} skills`);

/** Removes empty entries and case-insensitive duplicates, keeping the first spelling. */
function uniqueSkills(names: string[]): string[] {
	const seen = new Set<string>();
	return names.filter((name) => {
		const key = name.toLowerCase();
		if (!name || seen.has(key)) return false;
		seen.add(key);
		return true;
	});
}

export type CategoryFormResult = { ok: true; value: CategoryInput } | { ok: false; errors: Record<string, string> };

export function parseCategoryForm(fields: Record<string, unknown>): CategoryFormResult {
	const errors: Record<string, string> = {};

	const translations = {} as Record<Locale, CategoryTranslation>;
	for (const locale of LOCALES) {
		const result = nameSchema.safeParse(fields[categoryField(locale)] ?? '');
		if (result.success) translations[locale] = { name: result.data };
		else errors[categoryField(locale)] = result.error.issues[0].message;
	}

	let skills: string[] = [];
	try {
		const parsed = skillsSchema.safeParse(JSON.parse(String(fields.skills ?? '[]')));
		if (parsed.success) skills = uniqueSkills(parsed.data);
		else errors.skills = parsed.error.issues[0].message;
	} catch {
		errors.skills = 'Skills are not valid JSON';
	}

	return Object.keys(errors).length > 0 ? { ok: false, errors } : { ok: true, value: { translations, skills } };
}

export function toCategoryView(record: CategoryRecord, locale: Locale): CategoryView | null {
	const t = record.translations[locale] ?? LOCALES.map((l) => record.translations[l]).find(Boolean);
	return t ? { id: record.id, name: t.name, skills: record.skills.map((s) => s.name) } : null;
}

/** "N tools": a skill listed in several categories counts once. */
export function countUniqueSkills(categories: CategoryView[]): number {
	return new Set(categories.flatMap((c) => c.skills.map((s) => s.toLowerCase()))).size;
}
