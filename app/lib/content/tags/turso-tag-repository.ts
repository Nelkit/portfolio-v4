import { asc, eq } from 'drizzle-orm';
import type { LibSQLDatabase } from 'drizzle-orm/libsql';
import { postTags, tags, tagTranslations } from '@/app/lib/db/schema';
import type { Locale } from '@/app/lib/i18n/locales';
import { isLocale } from '@/app/lib/i18n/routing';
import type { TagRepository } from './tag-repository';
import type { TagInput, TagRecord, TagTranslation } from './tag';

/** Adapter: TagRepository backed by Turso/libSQL through Drizzle. */
export function createTursoTagRepository(db: LibSQLDatabase): TagRepository {
	async function load(where?: ReturnType<typeof eq>): Promise<TagRecord[]> {
		const rows = await db.select().from(tags).where(where).orderBy(asc(tags.slug));
		if (rows.length === 0) return [];
		const translationRows = await db.select().from(tagTranslations);
		return rows.map((row) => {
			const translations: Partial<Record<Locale, TagTranslation>> = {};
			for (const t of translationRows) {
				if (t.tagId === row.id && isLocale(t.locale)) translations[t.locale] = { name: t.name };
			}
			return { id: row.id, slug: row.slug, translations };
		});
	}

	const translationInserts = (tagId: number, input: TagInput) =>
		(Object.entries(input.translations) as [Locale, TagTranslation][]).map(([locale, t]) =>
			db.insert(tagTranslations).values({ tagId, locale, name: t.name }),
		);

	return {
		listTags: () => load(),
		getTag: async (id) => (await load(eq(tags.id, id)))[0] ?? null,
		getTagBySlug: async (slug) => (await load(eq(tags.slug, slug)))[0] ?? null,

		async createTag(input) {
			return db.transaction(async (tx) => {
				const [{ id }] = await tx.insert(tags).values({ slug: input.slug }).returning({ id: tags.id });
				for (const [locale, t] of Object.entries(input.translations) as [Locale, TagTranslation][]) {
					await tx.insert(tagTranslations).values({ tagId: id, locale, name: t.name });
				}
				return id;
			});
		},

		async updateTag(id, input) {
			const [first, ...rest] = translationInserts(id, input);
			await db.batch([
				db.update(tags).set({ slug: input.slug }).where(eq(tags.id, id)),
				db.delete(tagTranslations).where(eq(tagTranslations.tagId, id)),
				...(first ? [first, ...rest] : []),
			]);
		},

		async deleteTag(id) {
			// Explicit instead of relying on SQLite's foreign_keys pragma.
			await db.batch([
				db.delete(postTags).where(eq(postTags.tagId, id)),
				db.delete(tagTranslations).where(eq(tagTranslations.tagId, id)),
				db.delete(tags).where(eq(tags.id, id)),
			]);
		},
	};
}
