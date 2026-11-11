import { eq, inArray, sql } from 'drizzle-orm';
import type { LibSQLDatabase } from 'drizzle-orm/libsql';
import { posts, postTranslations } from '@/app/lib/db/schema';
import type { Locale } from '@/app/lib/i18n/locales';
import { isLocale } from '@/app/lib/i18n/routing';
import type { PostRepository } from './post-repository';
import { sortPosts, type PostInput, type PostRecord, type PostTranslation } from './post';

/** Adapter: PostRepository backed by Turso/libSQL through Drizzle. */
export function createTursoPostRepository(db: LibSQLDatabase): PostRepository {
	async function load(where?: ReturnType<typeof eq>): Promise<PostRecord[]> {
		const rows = await db.select().from(posts).where(where);
		if (rows.length === 0) return [];
		const translationRows = await db
			.select()
			.from(postTranslations)
			.where(inArray(postTranslations.postId, rows.map((r) => r.id)));
		return sortPosts(
			rows.map((row) => {
				const translations: Partial<Record<Locale, PostTranslation>> = {};
				for (const t of translationRows) {
					if (t.postId === row.id && isLocale(t.locale)) {
						translations[t.locale] = { title: t.title, summary: t.summary, body: t.body };
					}
				}
				return { id: row.id, slug: row.slug, publishedOn: row.publishedOn, translations };
			}),
		);
	}

	const translationInserts = (postId: number, input: PostInput) =>
		(Object.entries(input.translations) as [Locale, PostTranslation][]).map(([locale, t]) =>
			db.insert(postTranslations).values({ postId, locale, ...t }),
		);

	return {
		listPosts: () => load(),

		async getPost(id) {
			return (await load(eq(posts.id, id)))[0] ?? null;
		},

		async getPostBySlug(slug) {
			return (await load(eq(posts.slug, slug)))[0] ?? null;
		},

		async createPost(input) {
			return db.transaction(async (tx) => {
				const [{ id }] = await tx
					.insert(posts)
					.values({ slug: input.slug, publishedOn: input.publishedOn })
					.returning({ id: posts.id });
				for (const [locale, t] of Object.entries(input.translations) as [Locale, PostTranslation][]) {
					await tx.insert(postTranslations).values({ postId: id, locale, ...t });
				}
				return id;
			});
		},

		async updatePost(id, input) {
			const [first, ...rest] = translationInserts(id, input);
			await db.batch([
				db
					.update(posts)
					.set({ slug: input.slug, publishedOn: input.publishedOn, updatedAt: sql`(unixepoch())` })
					.where(eq(posts.id, id)),
				db.delete(postTranslations).where(eq(postTranslations.postId, id)),
				...(first ? [first, ...rest] : []),
			]);
		},

		async deletePost(id) {
			// Children first: does not rely on SQLite's foreign_keys pragma being on.
			await db.batch([
				db.delete(postTranslations).where(eq(postTranslations.postId, id)),
				db.delete(posts).where(eq(posts.id, id)),
			]);
		},
	};
}
