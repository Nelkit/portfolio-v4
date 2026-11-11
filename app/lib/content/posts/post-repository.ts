import type { PostImage, PostInput, PostRecord } from './post';

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
	/** Deletes the post and returns the storage keys of its files (cover + images). */
	deletePost(id: number): Promise<string[]>;

	/** Sets (or clears) the cover; returns the previous key. */
	setPostCover(id: number, key: string | null): Promise<string | null>;
	addPostImage(postId: number, key: string): Promise<number>;
	listPostImages(postId: number): Promise<PostImage[]>;
	/** Removes an image of THAT post; returns its key, or null if not found. */
	removePostImage(postId: number, imageId: number): Promise<string | null>;
}
