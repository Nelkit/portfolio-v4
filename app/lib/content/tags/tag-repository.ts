import type { TagInput, TagRecord } from './tag';

/** Port for blog tags. Implementations THROW on infrastructure errors. */
export interface TagRepository {
	listTags(): Promise<TagRecord[]>;
	getTag(id: number): Promise<TagRecord | null>;
	getTagBySlug(slug: string): Promise<TagRecord | null>;
	/** Throws if the slug is taken. */
	createTag(input: TagInput): Promise<number>;
	updateTag(id: number, input: TagInput): Promise<void>;
	/** Deletes the tag and removes it from every post (the posts are kept). */
	deleteTag(id: number): Promise<void>;
}
