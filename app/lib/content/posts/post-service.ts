import { cachedRead } from '@/app/lib/cache/cached-read';
import { getDb } from '@/app/lib/db/client';
import type { Locale } from '@/app/lib/i18n/locales';
import { publicUrlFor } from '@/app/lib/storage/storage';
import { loadTagViews, TAGS_TAG } from '@/app/lib/content/tags/tag-service';
import { publishedOnly, toPostView, type PostView } from './post';
import { createTursoPostRepository } from './turso-post-repository';
import type { PostRepository } from './post-repository';

/** Cache tag for every public read of blog posts. */
export const POSTS_TAG = 'posts';

export function postRepository(): PostRepository {
	return createTursoPostRepository(getDb());
}

/** Published posts written in this language, newest first. Shows tag names → both tags. */
export const getPublishedPosts = cachedRead(
	async (locale: Locale): Promise<PostView[]> => {
		const [records, tags] = await Promise.all([postRepository().listPosts(), loadTagViews(locale)]);
		return publishedOnly(records)
			.map((record) => toPostView(record, locale, publicUrlFor, tags))
			.filter((view): view is PostView => view !== null);
	},
	['posts'],
	[POSTS_TAG, TAGS_TAG],
);

/**
 * One post in one language. `exists` tells a post that exists only in the
 * other language (→ redirect to this language's list) from an unknown slug (→ 404).
 */
export const getPublishedPost = cachedRead(
	async (locale: Locale, slug: string): Promise<{ post: PostView | null; exists: boolean }> => {
		const [found, tags] = await Promise.all([postRepository().getPostBySlug(slug), loadTagViews(locale)]);
		// A draft behaves exactly like a post that does not exist (404, nothing revealed).
		const record = found?.status === 'published' ? found : null;
		return { post: record ? toPostView(record, locale, publicUrlFor, tags) : null, exists: record !== null };
	},
	['post'],
	[POSTS_TAG, TAGS_TAG],
);
