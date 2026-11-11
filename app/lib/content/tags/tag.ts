import { z } from 'zod';
import { LOCALES, type Locale } from '@/app/lib/i18n/locales';
import { SLUG_PATTERN, slugify } from '@/app/lib/content/projects/project';

export type TagTranslation = { name: string };
export type TagInput = { slug: string; translations: Record<Locale, TagTranslation> };
export type TagRecord = { id: number; slug: string; translations: Partial<Record<Locale, TagTranslation>> };
/** What the public site renders for one language. */
export type TagView = { id: number; slug: string; name: string };

export const tagField = (locale: Locale) => `name_${locale}`;

const nameSchema = z.string().trim().min(1, 'Required').max(40, 'Max 40 characters');

export type TagFormResult = { ok: true; value: TagInput } | { ok: false; errors: Record<string, string> };

/** Bilingual name required; empty slug → derived from the English name. */
export function parseTagForm(fields: Record<string, unknown>): TagFormResult {
	const errors: Record<string, string> = {};
	const translations = {} as Record<Locale, TagTranslation>;
	for (const locale of LOCALES) {
		const result = nameSchema.safeParse(fields[tagField(locale)] ?? '');
		if (result.success) translations[locale] = { name: result.data };
		else errors[tagField(locale)] = result.error.issues[0].message;
	}

	const slug = String(fields.slug ?? '').trim() || slugify(translations.en?.name ?? '');
	if (!errors.name_en && !(SLUG_PATTERN.test(slug) && slug.length <= 60)) {
		errors.slug = 'Use lowercase letters, numbers and dashes';
	}

	return Object.keys(errors).length > 0 ? { ok: false, errors } : { ok: true, value: { slug, translations } };
}

export function toTagView(record: TagRecord, locale: Locale): TagView | null {
	const t = record.translations[locale] ?? LOCALES.map((l) => record.translations[l]).find(Boolean);
	return t ? { id: record.id, slug: record.slug, name: t.name } : null;
}

export type TagChip = TagView & { count: number };

/** Tags used by the given posts, with how many posts use each, sorted by name. */
export function tagChips(tags: TagView[], posts: { tags: TagView[] }[]): TagChip[] {
	return tags
		.map((tag) => ({ ...tag, count: posts.filter((p) => p.tags.some((t) => t.id === tag.id)).length }))
		.filter((chip) => chip.count > 0)
		.sort((a, b) => a.name.localeCompare(b.name));
}
