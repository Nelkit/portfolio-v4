import type { YearMonth } from '@/app/lib/content/dates';

const MONTHS = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
const OPEN_END = /^(present|now|current|actualidad|actual)$/i;

/** "Jan 2016" | "2016" → YearMonth. Year-only: January (start) or December (end). */
function parsePoint(text: string, edge: 'start' | 'end'): YearMonth | null {
	const match = /^(?:([a-z]+)\.?\s+)?(\d{4})$/i.exec(text.trim());
	if (!match) return null;
	const year = Number(match[2]);
	if (!match[1]) return { year, month: edge === 'start' ? 1 : 12 };
	const month = MONTHS.indexOf(match[1].slice(0, 3).toLowerCase()) + 1;
	return month > 0 ? { year, month } : null;
}

/** Free-text Strapi period ("Jan 2016 – Apr 2017", "2025 - Present") → dates. */
export function parsePeriod(text: string): { start: YearMonth; end: YearMonth | null } {
	const [rawStart, rawEnd] = text.split(/\s*[–—-]\s*/);
	const start = parsePoint(rawStart ?? '', 'start');
	if (!start) throw new Error(`Cannot parse period: "${text}"`);
	if (rawEnd === undefined) return { start, end: parsePoint(rawStart, 'end') };
	if (OPEN_END.test(rawEnd.trim())) return { start, end: null };
	const end = parsePoint(rawEnd, 'end');
	if (!end) throw new Error(`Cannot parse period: "${text}"`);
	return { start, end };
}
