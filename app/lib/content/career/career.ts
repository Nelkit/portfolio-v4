import { z } from 'zod';
import { LOCALES, type Locale } from '@/app/lib/i18n/locales';

export type YearMonth = { year: number; month: number };
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

/** `<input type="month">` value ("YYYY-MM") ↔ YearMonth. */
export const toMonthInput = (ym: YearMonth | null) =>
	ym ? `${ym.year}-${String(ym.month).padStart(2, '0')}` : '';

function parseMonthInput(raw: unknown): YearMonth | null {
	const match = /^(\d{4})-(\d{2})$/.exec(String(raw ?? '').trim());
	if (!match) return null;
	const year = Number(match[1]);
	const month = Number(match[2]);
	if (year < 1950 || year > 2100 || month < 1 || month > 12) return null;
	return { year, month };
}

const toIndex = (ym: YearMonth) => ym.year * 12 + (ym.month - 1);

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
	else if (start && end && toIndex(end) < toIndex(start)) errors.end = 'The end cannot be before the start';

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

/** "Mar 2021 — Now" / "mar 2021 — Actual", with month names from Intl in the page language. */
export function formatPeriod(start: YearMonth, end: YearMonth | null, dateLocale: string, presentLabel: string): string {
	const format = (ym: YearMonth) => {
		const month = new Intl.DateTimeFormat(dateLocale, { month: 'short', timeZone: 'UTC' })
			.format(new Date(Date.UTC(ym.year, ym.month - 1, 1)))
			.replace('.', '');
		return `${month} ${ym.year}`;
	};
	return `${format(start)} — ${end ? format(end) : presentLabel}`;
}

/** Current roles first, then by start date, newest first. */
export function sortCareer<T extends { start: YearMonth; end: YearMonth | null }>(entries: T[]): T[] {
	return [...entries].sort((a, b) => {
		if ((a.end === null) !== (b.end === null)) return a.end === null ? -1 : 1;
		return toIndex(b.start) - toIndex(a.start);
	});
}

/** Full years from the earliest start to `today`. */
export function careerYears(entries: { start: YearMonth }[], today = new Date()): number {
	if (entries.length === 0) return 0;
	const earliest = Math.min(...entries.map((e) => toIndex(e.start)));
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
