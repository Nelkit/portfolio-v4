import { eq, inArray } from 'drizzle-orm';
import type { LibSQLDatabase } from 'drizzle-orm/libsql';
import { careerEntries, careerEntryTranslations } from '@/app/lib/db/schema';
import type { Locale } from '@/app/lib/i18n/locales';
import { isLocale } from '@/app/lib/i18n/routing';
import type { CareerRepository } from './career-repository';
import { sortCareer, type CareerInput, type CareerRecord, type CareerTranslation } from './career';

const dates = (input: CareerInput) => ({
	startYear: input.start.year,
	startMonth: input.start.month,
	endYear: input.end?.year ?? null,
	endMonth: input.end?.month ?? null,
});

/** Adapter: CareerRepository backed by Turso/libSQL through Drizzle. */
export function createTursoCareerRepository(db: LibSQLDatabase): CareerRepository {
	async function load(where?: ReturnType<typeof eq>): Promise<CareerRecord[]> {
		const rows = await db.select().from(careerEntries).where(where);
		if (rows.length === 0) return [];
		const translationRows = await db
			.select()
			.from(careerEntryTranslations)
			.where(inArray(careerEntryTranslations.entryId, rows.map((r) => r.id)));
		const records = rows.map((row) => {
			const translations: Partial<Record<Locale, CareerTranslation>> = {};
			for (const t of translationRows) {
				if (t.entryId === row.id && isLocale(t.locale)) translations[t.locale] = { title: t.title, detail: t.detail };
			}
			return {
				id: row.id,
				start: { year: row.startYear, month: row.startMonth },
				end: row.endYear !== null && row.endMonth !== null ? { year: row.endYear, month: row.endMonth } : null,
				translations,
			};
		});
		return sortCareer(records);
	}

	const translationInserts = (entryId: number, input: CareerInput) =>
		(Object.entries(input.translations) as [Locale, CareerTranslation][]).map(([locale, t]) =>
			db.insert(careerEntryTranslations).values({ entryId, locale, ...t }),
		);

	return {
		listEntries: () => load(),

		async getEntry(id) {
			return (await load(eq(careerEntries.id, id)))[0] ?? null;
		},

		async createEntry(input) {
			return db.transaction(async (tx) => {
				const [{ id }] = await tx.insert(careerEntries).values(dates(input)).returning({ id: careerEntries.id });
				for (const [locale, t] of Object.entries(input.translations) as [Locale, CareerTranslation][]) {
					await tx.insert(careerEntryTranslations).values({ entryId: id, locale, ...t });
				}
				return id;
			});
		},

		async updateEntry(id, input) {
			const [first, ...rest] = translationInserts(id, input);
			await db.batch([
				db.update(careerEntries).set(dates(input)).where(eq(careerEntries.id, id)),
				db.delete(careerEntryTranslations).where(eq(careerEntryTranslations.entryId, id)),
				...(first ? [first, ...rest] : []),
			]);
		},

		async deleteEntry(id) {
			// Children first: does not rely on SQLite's foreign_keys pragma being on.
			await db.batch([
				db.delete(careerEntryTranslations).where(eq(careerEntryTranslations.entryId, id)),
				db.delete(careerEntries).where(eq(careerEntries.id, id)),
			]);
		},
	};
}
