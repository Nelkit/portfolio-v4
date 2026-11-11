import { eq, inArray } from 'drizzle-orm';
import type { LibSQLDatabase } from 'drizzle-orm/libsql';
import { educationEntries, educationEntryTranslations } from '@/app/lib/db/schema';
import type { Locale } from '@/app/lib/i18n/locales';
import { isLocale } from '@/app/lib/i18n/routing';
import type { EducationRepository } from './education-repository';
import { sortEducation, type EducationInput, type EducationRecord, type EducationTranslation } from './education';

const columns = (input: EducationInput) => ({
	startYear: input.start.year,
	startMonth: input.start.month,
	endYear: input.end?.year ?? null,
	endMonth: input.end?.month ?? null,
	inProgress: input.inProgress,
});

/** Adapter: EducationRepository backed by Turso/libSQL through Drizzle. */
export function createTursoEducationRepository(db: LibSQLDatabase): EducationRepository {
	async function load(where?: ReturnType<typeof eq>): Promise<EducationRecord[]> {
		const rows = await db.select().from(educationEntries).where(where);
		if (rows.length === 0) return [];
		const translationRows = await db
			.select()
			.from(educationEntryTranslations)
			.where(inArray(educationEntryTranslations.entryId, rows.map((r) => r.id)));
		return sortEducation(
			rows.map((row) => {
				const translations: Partial<Record<Locale, EducationTranslation>> = {};
				for (const t of translationRows) {
					if (t.entryId === row.id && isLocale(t.locale)) {
						translations[t.locale] = { degree: t.degree, institution: t.institution, description: t.description };
					}
				}
				return {
					id: row.id,
					start: { year: row.startYear, month: row.startMonth },
					end: row.endYear !== null && row.endMonth !== null ? { year: row.endYear, month: row.endMonth } : null,
					inProgress: row.inProgress,
					translations,
				};
			}),
		);
	}

	const translationInserts = (entryId: number, input: EducationInput) =>
		(Object.entries(input.translations) as [Locale, EducationTranslation][]).map(([locale, t]) =>
			db.insert(educationEntryTranslations).values({ entryId, locale, ...t }),
		);

	return {
		listEntries: () => load(),

		async getEntry(id) {
			return (await load(eq(educationEntries.id, id)))[0] ?? null;
		},

		async createEntry(input) {
			return db.transaction(async (tx) => {
				const [{ id }] = await tx.insert(educationEntries).values(columns(input)).returning({ id: educationEntries.id });
				for (const [locale, t] of Object.entries(input.translations) as [Locale, EducationTranslation][]) {
					await tx.insert(educationEntryTranslations).values({ entryId: id, locale, ...t });
				}
				return id;
			});
		},

		async updateEntry(id, input) {
			const [first, ...rest] = translationInserts(id, input);
			await db.batch([
				db.update(educationEntries).set(columns(input)).where(eq(educationEntries.id, id)),
				db.delete(educationEntryTranslations).where(eq(educationEntryTranslations.entryId, id)),
				...(first ? [first, ...rest] : []),
			]);
		},

		async deleteEntry(id) {
			// Children first: does not rely on SQLite's foreign_keys pragma being on.
			await db.batch([
				db.delete(educationEntryTranslations).where(eq(educationEntryTranslations.entryId, id)),
				db.delete(educationEntries).where(eq(educationEntries.id, id)),
			]);
		},
	};
}
