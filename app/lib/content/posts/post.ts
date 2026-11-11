import { z } from 'zod';
import { LOCALES, type Locale } from '@/app/lib/i18n/locales';
import { SLUG_PATTERN, slugify } from '@/app/lib/content/projects/project';

export type PostTranslation = { title: string; summary: string; body: string };
/** A post may exist in one or both languages (only written languages are stored). */
export type PostInput = { slug: string; publishedOn: string; translations: Partial<Record<Locale, PostTranslation>> };
export type PostRecord = PostInput & { id: number };
/** What the public site renders for one language. */
export type PostView = {
	slug: string;
	publishedOn: string;
	title: string;
	summary: string;
	body: string;
	readingTime: number;
	/** Languages this post is available in. */
	locales: Locale[];
};

/** Listing data without the (possibly long) body — what crosses to client components. */
export type PostSummary = Omit<PostView, 'body'>;
export const toPostSummary = (view: PostView): PostSummary => ({
	slug: view.slug,
	publishedOn: view.publishedOn,
	title: view.title,
	summary: view.summary,
	readingTime: view.readingTime,
	locales: view.locales,
});

export const POST_KEYS = ['title', 'summary', 'body'] as const;
export const postField = (key: keyof PostTranslation, locale: Locale) => `${key}_${locale}`;

const WORDS_PER_MINUTE = 200;

/** Minutes to read, rounded up, at least 1. */
export function readingTime(markdown: string): number {
	const words = markdown.trim().split(/\s+/).filter(Boolean).length;
	return Math.max(1, Math.ceil(words / WORDS_PER_MINUTE));
}

const TEXT = {
	title: z.string().trim().min(1, 'Required').max(160, 'Max 160 characters'),
	summary: z.string().trim().max(400, 'Max 400 characters'),
	body: z.string().trim().min(1, 'Required').max(100_000, 'Too long'),
} as const;

const DATE = /^(\d{4})-(\d{2})-(\d{2})$/;
function isValidDate(value: string) {
	const m = DATE.exec(value);
	if (!m) return false;
	const date = new Date(Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3])));
	return date.getUTCFullYear() === Number(m[1]) && date.getUTCMonth() === Number(m[2]) - 1 && date.getUTCDate() === Number(m[3]);
}

export type PostFormResult = { ok: true; value: PostInput } | { ok: false; errors: Record<string, string> };

export function parsePostForm(fields: Record<string, unknown>): PostFormResult {
	const errors: Record<string, string> = {};
	const translations: Partial<Record<Locale, PostTranslation>> = {};

	for (const locale of LOCALES) {
		const raw = Object.fromEntries(POST_KEYS.map((k) => [k, String(fields[postField(k, locale)] ?? '')]));
		// A language counts as written as soon as any of its fields has content.
		if (!POST_KEYS.some((k) => raw[k].trim())) continue;
		const values = {} as PostTranslation;
		for (const key of POST_KEYS) {
			const result = TEXT[key].safeParse(raw[key]);
			if (result.success) values[key] = result.data;
			else errors[postField(key, locale)] = result.error.issues[0].message;
		}
		translations[locale] = values;
	}
	if (Object.keys(translations).length === 0) errors.translations = 'Write the post in at least one language';

	const firstTitle = translations.en?.title ?? translations.es?.title ?? '';
	const slug = String(fields.slug ?? '').trim() || slugify(firstTitle);
	if (!errors.translations && !(SLUG_PATTERN.test(slug) && slug.length <= 80)) {
		errors.slug = 'Use lowercase letters, numbers and dashes';
	}

	const publishedOn = String(fields.publishedOn ?? '').trim();
	if (!isValidDate(publishedOn)) errors.publishedOn = 'Pick a valid date';

	if (Object.keys(errors).length > 0) return { ok: false, errors };
	return { ok: true, value: { slug, publishedOn, translations } };
}

/** Newest publication date first; ties: newest post first. */
export function sortPosts<T extends { id: number; publishedOn: string }>(list: T[]): T[] {
	return [...list].sort((a, b) => b.publishedOn.localeCompare(a.publishedOn) || b.id - a.id);
}

/** No fallback: a post not written in this language has no view in it. */
export function toPostView(record: PostRecord, locale: Locale): PostView | null {
	const t = record.translations[locale];
	if (!t) return null;
	return {
		slug: record.slug,
		publishedOn: record.publishedOn,
		title: t.title,
		summary: t.summary,
		body: t.body,
		readingTime: readingTime(t.body),
		locales: LOCALES.filter((l) => record.translations[l]),
	};
}

/** Fenced code blocks of a Markdown body (to pre-highlight them on the server). */
export function extractCodeBlocks(markdown: string): { lang: string | undefined; code: string }[] {
	return [...markdown.matchAll(/^```([\w+-]*)[^\n]*\n([\s\S]*?)\n```/gm)].map((m) => ({
		lang: m[1] || undefined,
		code: m[2],
	}));
}
