import { describe, expect, it } from 'vitest';
import { careerYears, formatPeriod, parseCareerForm, sortCareer, toCareerView, type CareerRecord } from './career';

const fields = {
	start: '2021-03',
	end: '',
	title_en: ' Senior Mobile Engineer ',
	title_es: 'Ingeniero Móvil Senior',
	detail_en: 'Acme · iOS & Android',
	detail_es: 'Acme · iOS y Android',
};

describe('parseCareerForm', () => {
	it('accepts a current role (empty end) and trims texts', () => {
		expect(parseCareerForm(fields)).toEqual({
			ok: true,
			value: {
				start: { year: 2021, month: 3 },
				end: null,
				translations: {
					en: { title: 'Senior Mobile Engineer', detail: 'Acme · iOS & Android' },
					es: { title: 'Ingeniero Móvil Senior', detail: 'Acme · iOS y Android' },
				},
			},
		});
	});

	it('accepts a past role with an end date', () => {
		const result = parseCareerForm({ ...fields, end: '2023-11' });
		expect(result.ok && result.value.end).toEqual({ year: 2023, month: 11 });
	});

	it('rejects an end date before the start date', () => {
		const result = parseCareerForm({ ...fields, start: '2022-05', end: '2022-04' });
		expect(result.ok).toBe(false);
		if (!result.ok) expect(result.errors.end).toBeDefined();
	});

	it('rejects malformed dates', () => {
		for (const start of ['', '2021', '2021-13', 'abc', '1899-01']) {
			const result = parseCareerForm({ ...fields, start });
			expect(result.ok, start).toBe(false);
		}
	});

	it('requires the title in every language; the detail is optional', () => {
		const result = parseCareerForm({ ...fields, title_es: '', detail_en: '', detail_es: '' });
		expect(result.ok).toBe(false);
		if (!result.ok) expect(Object.keys(result.errors)).toEqual(['title_es']);
		expect(parseCareerForm({ ...fields, detail_en: '', detail_es: '' }).ok).toBe(true);
	});
});

describe('formatPeriod', () => {
	it('formats months in the page language and uses the "present" label', () => {
		expect(formatPeriod({ year: 2021, month: 3 }, null, 'en-US', 'Now')).toBe('Mar 2021 — Now');
		expect(formatPeriod({ year: 2021, month: 3 }, { year: 2023, month: 11 }, 'en-US', 'Now')).toBe('Mar 2021 — Nov 2023');
		expect(formatPeriod({ year: 2021, month: 3 }, null, 'es-ES', 'Actual')).toBe('mar 2021 — Actual');
	});
});

const record = (id: number, start: [number, number], end: [number, number] | null): CareerRecord => ({
	id,
	start: { year: start[0], month: start[1] },
	end: end ? { year: end[0], month: end[1] } : null,
	translations: { en: { title: `t${id}`, detail: '' }, es: { title: `t${id}-es`, detail: '' } },
});

describe('sortCareer', () => {
	it('puts current roles first, then by start date, newest first', () => {
		const sorted = sortCareer([
			record(1, [2016, 1], [2018, 6]),
			record(2, [2019, 2], [2021, 2]),
			record(3, [2021, 3], null),
			record(4, [2018, 7], [2019, 1]),
		]);
		expect(sorted.map((r) => r.id)).toEqual([3, 2, 4, 1]);
	});
});

describe('careerYears', () => {
	it('counts full years from the earliest start to the reference date', () => {
		const today = new Date(2026, 10, 11); // Nov 2026
		expect(careerYears([record(1, [2016, 1], [2018, 6]), record(2, [2021, 3], null)], today)).toBe(10);
		expect(careerYears([record(1, [2025, 12], null)], today)).toBe(0);
		expect(careerYears([], today)).toBe(0);
	});
});

describe('toCareerView', () => {
	it('builds the localized view with period, current flag and texts', () => {
		const view = toCareerView(record(3, [2021, 3], null), 'es', 'es-ES', 'Actual');
		expect(view).toEqual({ id: 3, period: 'mar 2021 — Actual', current: true, title: 't3-es', detail: '' });
		expect(toCareerView(record(1, [2016, 1], [2018, 6]), 'en', 'en-US', 'Now')?.current).toBe(false);
	});
});
