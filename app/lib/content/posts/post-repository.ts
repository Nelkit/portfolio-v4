import type { PostInput, PostRecord } from './post';

/** Port for blog posts. Implementations THROW on infrastructure errors. */
export interface PostRepository {
	/** All posts, newest publication date first. */
	listPosts(): Promise<PostRecord[]>;
	getPost(id: number): Promise<PostRecord | null>;
	getPostBySlug(slug: string): Promise<PostRecord | null>;
	/** Throws if the slug is taken. */
	createPost(input: PostInput): Promise<number>;
	/** Replaces fields and the written languages (a dropped language is removed). */
	updatePost(id: number, input: PostInput): Promise<void>;
	deletePost(id: number): Promise<void>;
}
