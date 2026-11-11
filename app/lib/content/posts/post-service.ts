import { cachedRead } from '@/app/lib/cache/cached-read';
import { getDb } from '@/app/lib/db/client';
import type { Locale } from '@/app/lib/i18n/locales';
import { publicUrlFor } from '@/app/lib/storage/storage';
import { toPostView, type PostView } from './post';
import { createTursoPostRepository } from './turso-post-repository';
import type { PostRepository } from './post-repository';

/** Cache tag for every public read of blog posts. */
export const POSTS_TAG = 'posts';

export function postRepository(): PostRepository {
	return createTursoPostRepository(getDb());
}

/** Posts written in this language, newest first. */
export const getPublishedPosts = cachedRead(
	async (locale: Locale): Promise<PostView[]> =>
		(await postRepository().listPosts())
			.map((record) => toPostView(record, locale, publicUrlFor))
			.filter((view): view is PostView => view !== null),
	['posts'],
	[POSTS_TAG],
);

/**
 * One post in one language. `exists` tells a post that exists only in the
 * other language (→ redirect to this language's list) from an unknown slug (→ 404).
 */
export const getPublishedPost = cachedRead(
	async (locale: Locale, slug: string): Promise<{ post: PostView | null; exists: boolean }> => {
		const record = await postRepository().getPostBySlug(slug);
		return { post: record ? toPostView(record, locale, publicUrlFor) : null, exists: record !== null };
	},
	['post'],
	[POSTS_TAG],
);
