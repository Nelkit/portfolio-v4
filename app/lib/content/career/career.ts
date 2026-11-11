import { z } from 'zod';
import { LOCALES, type Locale } from '@/app/lib/i18n/locales';
import { formatPeriod, monthIndex, parseMonthInput, sortTimeline, type YearMonth } from '@/app/lib/content/dates';

export { formatPeriod, toMonthInput } from '@/app/lib/content/dates';
export type { YearMonth };
export type CareerTranslation = { title: string; detail: string };
/** `end: null` means the role is current. */
export type CareerInput = { start: YearMonth; end: YearMonth | null; translations: Record<Locale, CareerTranslation> };
export type CareerRecord = Omit<CareerInput, 'translations'> & {
	id: number;
	translations: Partial<Record<Locale, CareerTranslation>>;
};
/** What the public site renders for one language. */
export type CareerView = { id: number; period: string; current: boolean; title: string; detail: string };

export const careerField = (key: keyof CareerTranslation, locale: Locale) => `${key}_${locale}`;

const TEXT = {
	title: z.string().trim().min(1, 'Required').max(120, 'Max 120 characters'),
	detail: z.string().trim().max(300, 'Max 300 characters'),
} as const;

export type CareerFormResult = { ok: true; value: CareerInput } | { ok: false; errors: Record<string, string> };

export function parseCareerForm(fields: Record<string, unknown>): CareerFormResult {
	const errors: Record<string, string> = {};

	const start = parseMonthInput(fields.start);
	if (!start) errors.start = 'Pick a valid start month';

	const rawEnd = String(fields.end ?? '').trim();
	const end = rawEnd === '' ? null : parseMonthInput(rawEnd);
	if (rawEnd !== '' && !end) errors.end = 'Pick a valid end month (or leave it empty for a current role)';
	else if (start && end && monthIndex(end) < monthIndex(start)) errors.end = 'The end cannot be before the start';

	const translations = {} as Record<Locale, CareerTranslation>;
	for (const locale of LOCALES) {
		const values = {} as CareerTranslation;
		for (const key of ['title', 'detail'] as const) {
			const result = TEXT[key].safeParse(fields[careerField(key, locale)] ?? '');
			if (result.success) values[key] = result.data;
			else errors[careerField(key, locale)] = result.error.issues[0].message;
		}
		translations[locale] = values;
	}

	if (Object.keys(errors).length > 0 || !start) return { ok: false, errors };
	return { ok: true, value: { start, end, translations } };
}

/** Current roles first, then by start date, newest first. */
export function sortCareer<T extends { start: YearMonth; end: YearMonth | null }>(entries: T[]): T[] {
	return sortTimeline(entries, (e) => e.end === null);
}

/** Full years from the earliest start to `today`. */
export function careerYears(entries: { start: YearMonth }[], today = new Date()): number {
	if (entries.length === 0) return 0;
	const earliest = Math.min(...entries.map((e) => monthIndex(e.start)));
	const now = today.getFullYear() * 12 + today.getMonth();
	return Math.max(0, Math.floor((now - earliest) / 12));
}

export function toCareerView(record: CareerRecord, locale: Locale, dateLocale: string, presentLabel: string): CareerView | null {
	const t = record.translations[locale] ?? LOCALES.map((l) => record.translations[l]).find(Boolean);
	if (!t) return null;
	return {
		id: record.id,
		period: formatPeriod(record.start, record.end, dateLocale, presentLabel),
		current: record.end === null,
		title: t.title,
		detail: t.detail,
	};
}
