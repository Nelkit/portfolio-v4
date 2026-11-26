import { describe, expect, it } from 'vitest';
import { parseEducationForm, sortEducation, toEducationView, type EducationRecord } from './education';

const fields = {
	start: '2025-02',
	end: '2026-12',
	inProgress: 'on',
	degree_en: ' Master of Data Science ',
	degree_es: 'Máster en Ciencia de Datos',
	institution_en: 'University of Sydney',
	institution_es: 'Universidad de Sídney',
	description_en: 'Scholarship',
	description_es: 'Becado',
	award_en: ' Summa Cum Laude ',
	award_es: 'Summa Cum Laude',
	note_en: 'HonduFuturo Scholar',
	note_es: 'Becario HonduFuturo',
};

describe('parseEducationForm', () => {
	it('accepts an in-progress entry with an expected end date, trimmed', () => {
		expect(parseEducationForm(fields)).toEqual({
			ok: true,
			value: {
				start: { year: 2025, month: 2 },
				end: { year: 2026, month: 12 },
				inProgress: true,
				translations: {
					en: {
						degree: 'Master of Data Science',
						institution: 'University of Sydney',
						description: 'Scholarship',
						award: 'Summa Cum Laude',
						note: 'HonduFuturo Scholar',
					},
					es: {
						degree: 'Máster en Ciencia de Datos',
						institution: 'Universidad de Sídney',
						description: 'Becado',
						award: 'Summa Cum Laude',
						note: 'Becario HonduFuturo',
					},
				},
			},
		});
	});

	it('accepts an in-progress entry without end date', () => {
		const result = parseEducationForm({ ...fields, end: '' });
		expect(result.ok && result.value.end).toBeNull();
	});

	it('requires an end date for a completed entry', () => {
		const result = parseEducationForm({ ...fields, end: '', inProgress: undefined });
		expect(result.ok).toBe(false);
		if (!result.ok) expect(result.errors.end).toBeDefined();
		const completed = parseEducationForm({ ...fields, inProgress: undefined });
		expect(completed.ok && completed.value.inProgress).toBe(false);
	});

	it('rejects an end before the start and malformed dates', () => {
		expect(parseEducationForm({ ...fields, start: '2027-01' }).ok).toBe(false);
		expect(parseEducationForm({ ...fields, start: '2025-13' }).ok).toBe(false);
	});

	it('keeps award and note optional, with short limits', () => {
		const empty = parseEducationForm({ ...fields, award_en: '', note_es: undefined });
		expect(empty.ok && empty.value.translations.en.award).toBe('');
		expect(empty.ok && empty.value.translations.es.note).toBe('');

		const long = parseEducationForm({ ...fields, award_en: 'x'.repeat(61), note_es: 'x'.repeat(301) });
		expect(long.ok).toBe(false);
		if (!long.ok) expect(Object.keys(long.errors).sort()).toEqual(['award_en', 'note_es']);
	});

	it('requires degree and institution in every language; description is optional', () => {
		const result = parseEducationForm({ ...fields, degree_es: '', institution_en: ' ', description_en: '' });
		expect(result.ok).toBe(false);
		if (!result.ok) expect(Object.keys(result.errors).sort()).toEqual(['degree_es', 'institution_en']);
	});
});

const record = (id: number, start: [number, number], end: [number, number] | null, inProgress: boolean): EducationRecord => ({
	id,
	start: { year: start[0], month: start[1] },
	end: end ? { year: end[0], month: end[1] } : null,
	inProgress,
	translations: {
		en: { degree: `d${id}`, institution: `i${id}`, description: '', award: '', note: '' },
		es: { degree: `d${id}-es`, institution: `i${id}-es`, description: '', award: 'Summa Cum Laude', note: 'Beca' },
	},
});

describe('sortEducation', () => {
	it('puts in-progress entries first, then newest start first', () => {
		const sorted = sortEducation([
			record(1, [2010, 3], [2015, 12], false),
			record(2, [2025, 2], [2026, 12], true),
			record(3, [2016, 1], [2017, 6], false),
		]);
		expect(sorted.map((r) => r.id)).toEqual([2, 3, 1]);
	});
});

describe('toEducationView', () => {
	it('formats the period in the page language and exposes the status', () => {
		expect(toEducationView(record(2, [2025, 2], [2026, 12], true), 'es', 'es-ES', 'Actual')).toEqual({
			id: 2,
			period: 'feb 2025 — dic 2026',
			inProgress: true,
			degree: 'd2-es',
			institution: 'i2-es',
			description: '',
			award: 'Summa Cum Laude',
			note: 'Beca',
		});
		expect(toEducationView(record(4, [2025, 2], null, true), 'en', 'en-US', 'Now')?.period).toBe('Feb 2025 — Now');
	});
});
