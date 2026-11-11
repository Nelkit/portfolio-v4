import { z } from 'zod';
import { LOCALES, type Locale } from '@/app/lib/i18n/locales';

export const HEADLINE_MAX_LENGTH = 200;

export type Hero = {
	locale: Locale;
	/** Plain text; an optional <em>…</em> segment is rendered as the accent. */
	headline: string;
};

const headlineSchema = z.string().trim().min(1).max(HEADLINE_MAX_LENGTH);

export type ParseResult = { ok: true; headline: string } | { ok: false; error: string };

export function parseHeadlineInput(input: unknown): ParseResult {
	const result = headlineSchema.safeParse(input);
	if (result.success) return { ok: true, headline: result.data };
	return { ok: false, error: `Headline must be 1–${HEADLINE_MAX_LENGTH} characters.` };
}

export type Headlines = Record<Locale, string>;

export type HeroFormResult =
	| { ok: true; headlines: Headlines }
	| { ok: false; errors: Partial<Record<Locale, string>> };

/** Field name for a locale's headline in the admin form. */
export const headlineField = (locale: Locale) => `headline_${locale}`;

/** Content is bilingual: every locale's headline is required. */
export function parseHeroForm(fields: Record<string, unknown>): HeroFormResult {
	const headlines: Partial<Headlines> = {};
	const errors: Partial<Record<Locale, string>> = {};

	for (const locale of LOCALES) {
		const result = parseHeadlineInput(fields[headlineField(locale)]);
		if (result.ok) headlines[locale] = result.headline;
		else errors[locale] = result.error;
	}

	return Object.keys(errors).length > 0
		? { ok: false, errors }
		: { ok: true, headlines: headlines as Headlines };
}
