import { z } from 'zod';
import { LOCALES, type Locale } from '@/app/lib/i18n/locales';
import { formatPeriod, monthIndex, parseMonthInput, sortTimeline, type YearMonth } from '@/app/lib/content/dates';

export type EducationTranslation = { degree: string; institution: string; description: string };
/** `inProgress` is explicit; `end` may be the expected graduation (or null while ongoing). */
export type EducationInput = {
	start: YearMonth;
	end: YearMonth | null;
	inProgress: boolean;
	translations: Record<Locale, EducationTranslation>;
};
export type EducationRecord = Omit<EducationInput, 'translations'> & {
	id: number;
	translations: Partial<Record<Locale, EducationTranslation>>;
};
/** What the public site renders for one language. */
export type EducationView = {
	id: number;
	period: string;
	inProgress: boolean;
	degree: string;
	institution: string;
	description: string;
};

export const educationField = (key: keyof EducationTranslation, locale: Locale) => `${key}_${locale}`;
export const EDUCATION_KEYS = ['degree', 'institution', 'description'] as const;

const TEXT = {
	degree: z.string().trim().min(1, 'Required').max(150, 'Max 150 characters'),
	institution: z.string().trim().min(1, 'Required').max(120, 'Max 120 characters'),
	description: z.string().trim().max(300, 'Max 300 characters'),
} as const;

export type EducationFormResult = { ok: true; value: EducationInput } | { ok: false; errors: Record<string, string> };

export function parseEducationForm(fields: Record<string, unknown>): EducationFormResult {
	const errors: Record<string, string> = {};
	const inProgress = fields.inProgress === 'on' || fields.inProgress === 'true';

	const start = parseMonthInput(fields.start);
	if (!start) errors.start = 'Pick a valid start month';

	const rawEnd = String(fields.end ?? '').trim();
	const end = rawEnd === '' ? null : parseMonthInput(rawEnd);
	if (rawEnd !== '' && !end) errors.end = 'Pick a valid end month';
	else if (!end && !inProgress) errors.end = 'A completed entry needs an end date';
	else if (start && end && monthIndex(end) < monthIndex(start)) errors.end = 'The end cannot be before the start';

	const translations = {} as Record<Locale, EducationTranslation>;
	for (const locale of LOCALES) {
		const values = {} as EducationTranslation;
		for (const key of EDUCATION_KEYS) {
			const result = TEXT[key].safeParse(fields[educationField(key, locale)] ?? '');
			if (result.success) values[key] = result.data;
			else errors[educationField(key, locale)] = result.error.issues[0].message;
		}
		translations[locale] = values;
	}

	if (Object.keys(errors).length > 0 || !start) return { ok: false, errors };
	return { ok: true, value: { start, end, inProgress, translations } };
}

/** In-progress entries first, then newest start first. */
export function sortEducation<T extends { start: YearMonth; inProgress: boolean }>(entries: T[]): T[] {
	return sortTimeline(entries, (e) => e.inProgress);
}

export function toEducationView(
	record: EducationRecord,
	locale: Locale,
	dateLocale: string,
	presentLabel: string,
): EducationView | null {
	const t = record.translations[locale] ?? LOCALES.map((l) => record.translations[l]).find(Boolean);
	if (!t) return null;
	return {
		id: record.id,
		period: formatPeriod(record.start, record.end, dateLocale, presentLabel),
		inProgress: record.inProgress,
		degree: t.degree,
		institution: t.institution,
		description: t.description,
	};
}
