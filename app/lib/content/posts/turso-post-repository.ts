import { and, asc, eq, inArray, sql } from 'drizzle-orm';
import type { LibSQLDatabase } from 'drizzle-orm/libsql';
import { postImages, posts, postTags, postTranslations } from '@/app/lib/db/schema';
import type { Locale } from '@/app/lib/i18n/locales';
import { isLocale } from '@/app/lib/i18n/routing';
import type { PostRepository } from './post-repository';
import { sortPosts, type PostInput, type PostRecord, type PostTranslation } from './post';

/** Adapter: PostRepository backed by Turso/libSQL through Drizzle. */
export function createTursoPostRepository(db: LibSQLDatabase): PostRepository {
	async function load(where?: ReturnType<typeof eq>): Promise<PostRecord[]> {
		const rows = await db.select().from(posts).where(where);
		if (rows.length === 0) return [];
		const ids = rows.map((r) => r.id);
		const [translationRows, tagRows] = await Promise.all([
			db.select().from(postTranslations).where(inArray(postTranslations.postId, ids)),
			db.select().from(postTags).where(inArray(postTags.postId, ids)),
		]);
		return sortPosts(
			rows.map((row) => {
				const translations: Partial<Record<Locale, PostTranslation>> = {};
				for (const t of translationRows) {
					if (t.postId === row.id && isLocale(t.locale)) {
						translations[t.locale] = { title: t.title, summary: t.summary, body: t.body };
					}
				}
				return {
					id: row.id,
					slug: row.slug,
					publishedOn: row.publishedOn,
					status: row.status,
					coverKey: row.coverKey,
					tagIds: tagRows.filter((t) => t.postId === row.id).map((t) => t.tagId),
					translations,
				};
			}),
		);
	}

	const childInserts = (postId: number, input: PostInput) => [
		...(Object.entries(input.translations) as [Locale, PostTranslation][]).map(([locale, t]) =>
			db.insert(postTranslations).values({ postId, locale, ...t }),
		),
		...input.tagIds.map((tagId) => db.insert(postTags).values({ postId, tagId })),
	];

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
					.values({ slug: input.slug, publishedOn: input.publishedOn, status: input.status })
					.returning({ id: posts.id });
				for (const [locale, t] of Object.entries(input.translations) as [Locale, PostTranslation][]) {
					await tx.insert(postTranslations).values({ postId: id, locale, ...t });
				}
				for (const tagId of input.tagIds) await tx.insert(postTags).values({ postId: id, tagId });
				return id;
			});
		},

		async updatePost(id, input) {
			const [first, ...rest] = childInserts(id, input);
			await db.batch([
				db
					.update(posts)
					.set({ slug: input.slug, publishedOn: input.publishedOn, status: input.status, updatedAt: sql`(unixepoch())` })
					.where(eq(posts.id, id)),
				db.delete(postTranslations).where(eq(postTranslations.postId, id)),
				db.delete(postTags).where(eq(postTags.postId, id)),
				...(first ? [first, ...rest] : []),
			]);
		},

		async deletePost(id) {
			const [row] = await db.select({ coverKey: posts.coverKey }).from(posts).where(eq(posts.id, id)).limit(1);
			if (!row) return [];
			const images = await db.select({ key: postImages.key }).from(postImages).where(eq(postImages.postId, id));
			// Children first: does not rely on SQLite's foreign_keys pragma being on.
			await db.batch([
				db.delete(postTranslations).where(eq(postTranslations.postId, id)),
				db.delete(postTags).where(eq(postTags.postId, id)),
				db.delete(postImages).where(eq(postImages.postId, id)),
				db.delete(posts).where(eq(posts.id, id)),
			]);
			return [row.coverKey, ...images.map((i) => i.key)].filter((k): k is string => Boolean(k));
		},

		async setPostCover(id, key) {
			const [row] = await db.select({ coverKey: posts.coverKey }).from(posts).where(eq(posts.id, id)).limit(1);
			await db.update(posts).set({ coverKey: key, updatedAt: sql`(unixepoch())` }).where(eq(posts.id, id));
			return row?.coverKey ?? null;
		},

		async addPostImage(postId, key) {
			const [{ id }] = await db.insert(postImages).values({ postId, key }).returning({ id: postImages.id });
			return id;
		},

		listPostImages: (postId) =>
			db.select({ id: postImages.id, key: postImages.key }).from(postImages).where(eq(postImages.postId, postId)).orderBy(asc(postImages.id)),

		async removePostImage(postId, imageId) {
			const [row] = await db
				.delete(postImages)
				.where(and(eq(postImages.id, imageId), eq(postImages.postId, postId)))
				.returning({ key: postImages.key });
			return row?.key ?? null;
		},
	};
}
