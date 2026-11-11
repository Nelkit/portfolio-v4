/** Month-precision dates shared by the career and education timelines. */
export type YearMonth = { year: number; month: number };

/** Comparable month index. */
export const monthIndex = (ym: YearMonth) => ym.year * 12 + (ym.month - 1);

/** `<input type="month">` value ("YYYY-MM") ↔ YearMonth. */
export const toMonthInput = (ym: YearMonth | null) =>
	ym ? `${ym.year}-${String(ym.month).padStart(2, '0')}` : '';

export function parseMonthInput(raw: unknown): YearMonth | null {
	const match = /^(\d{4})-(\d{2})$/.exec(String(raw ?? '').trim());
	if (!match) return null;
	const year = Number(match[1]);
	const month = Number(match[2]);
	if (year < 1950 || year > 2100 || month < 1 || month > 12) return null;
	return { year, month };
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

/** Ongoing entries first, then by start date, newest first. */
export function sortTimeline<T extends { start: YearMonth }>(entries: T[], isOngoing: (entry: T) => boolean): T[] {
	return [...entries].sort((a, b) => {
		if (isOngoing(a) !== isOngoing(b)) return isOngoing(a) ? -1 : 1;
		return monthIndex(b.start) - monthIndex(a.start);
	});
}
