import { unstable_cache } from 'next/cache';
import { getDb } from '@/app/lib/db/client';
import type { Locale } from '@/app/lib/i18n/locales';
import { toPostView, type PostView } from './post';
import { createTursoPostRepository } from './turso-post-repository';
import type { PostRepository } from './post-repository';

/** Cache tag for every public read of blog posts. */
export const POSTS_TAG = 'posts';

export function postRepository(): PostRepository {
	return createTursoPostRepository(getDb());
}

/** Posts written in this language, newest first. */
export const getPublishedPosts = unstable_cache(
	async (locale: Locale): Promise<PostView[]> =>
		(await postRepository().listPosts())
			.map((record) => toPostView(record, locale))
			.filter((view): view is PostView => view !== null),
	['posts'],
	{ tags: [POSTS_TAG] },
);

/**
 * One post in one language. `exists` tells a post that exists only in the
 * other language (→ redirect to this language's list) from an unknown slug (→ 404).
 */
export const getPublishedPost = unstable_cache(
	async (locale: Locale, slug: string): Promise<{ post: PostView | null; exists: boolean }> => {
		const record = await postRepository().getPostBySlug(slug);
		return { post: record ? toPostView(record, locale) : null, exists: record !== null };
	},
	['post'],
	{ tags: [POSTS_TAG] },
);
