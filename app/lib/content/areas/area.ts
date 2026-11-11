import { z } from 'zod';
import { LOCALES, type Locale } from '@/app/lib/i18n/locales';

export type AreaTranslation = { name: string };
export type AreaInput = { translations: Record<Locale, AreaTranslation> };
export type AreaRecord = { id: number; translations: Partial<Record<Locale, AreaTranslation>> };
/** What the public site renders for one language. */
export type AreaView = { id: number; name: string };

export const areaField = (locale: Locale) => `name_${locale}`;

const nameSchema = z.string().trim().min(1, 'Required').max(40, 'Max 40 characters');

export type AreaFormResult = { ok: true; value: AreaInput } | { ok: false; errors: Record<string, string> };

/** Bilingual content: the name is required in every language. */
export function parseAreaForm(fields: Record<string, unknown>): AreaFormResult {
	const errors: Record<string, string> = {};
	const translations = {} as Record<Locale, AreaTranslation>;
	for (const locale of LOCALES) {
		const result = nameSchema.safeParse(fields[areaField(locale)] ?? '');
		if (result.success) translations[locale] = { name: result.data };
		else errors[areaField(locale)] = result.error.issues[0].message;
	}
	return Object.keys(errors).length > 0 ? { ok: false, errors } : { ok: true, value: { translations } };
}

export function toAreaView(record: AreaRecord, locale: Locale): AreaView | null {
	const t = record.translations[locale] ?? LOCALES.map((l) => record.translations[l]).find(Boolean);
	return t ? { id: record.id, name: t.name } : null;
}
