import { describe, expect, it } from 'vitest';
import { parsePeriod } from './periods';

describe('parsePeriod', () => {
	it('parses "Mon YYYY – Mon YYYY" (career)', () => {
		expect(parsePeriod('Jan 2016 – Apr 2017')).toEqual({ start: { year: 2016, month: 1 }, end: { year: 2017, month: 4 } });
		expect(parsePeriod('May 2019 - Oct 2021')).toEqual({ start: { year: 2019, month: 5 }, end: { year: 2021, month: 10 } });
	});

	it('treats "Present"/"Now" as an open end', () => {
		expect(parsePeriod('Oct 2022 – Present')).toEqual({ start: { year: 2022, month: 10 }, end: null });
		expect(parsePeriod('2025 – now')).toEqual({ start: { year: 2025, month: 1 }, end: null });
	});

	it('parses year-only periods: January for the start, December for the end (education)', () => {
		expect(parsePeriod('2011 - 2015')).toEqual({ start: { year: 2011, month: 1 }, end: { year: 2015, month: 12 } });
		expect(parsePeriod('2025 - Present')).toEqual({ start: { year: 2025, month: 1 }, end: null });
	});

	it('accepts full month names and a single year', () => {
		expect(parsePeriod('September 2020 — March 2021')).toEqual({ start: { year: 2020, month: 9 }, end: { year: 2021, month: 3 } });
		expect(parsePeriod('2019')).toEqual({ start: { year: 2019, month: 1 }, end: { year: 2019, month: 12 } });
	});

	it('throws on text it cannot understand (better than importing a wrong date)', () => {
		expect(() => parsePeriod('sometime')).toThrow(/sometime/);
	});
});
