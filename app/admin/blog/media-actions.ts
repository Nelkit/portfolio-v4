'use server';

import { updateTag } from 'next/cache';
import { z } from 'zod';
import { requireAdmin } from '@/app/lib/auth/admin';
import { imageMarkdown, referencedUploadKeys } from '@/app/lib/content/posts/post';
import { POSTS_TAG, postRepository } from '@/app/lib/content/posts/post-service';
import { LOCALES } from '@/app/lib/i18n/locales';
import { PROJECT_IMAGE_MAX_BYTES, validateUpload } from '@/app/lib/storage/file-validation';
import { buildKey } from '@/app/lib/storage/storage';
import { deleteStoredFiles, storageOrError } from '@/app/lib/storage/cleanup';

/**
 * Post images, one file per request (under the Server Action body limit),
 * attached to the post immediately — same pattern as project images.
 */
export type PostMediaResult = { error?: string; markdown?: string };

const id = z.coerce.number().int().positive();

async function storeImage(formData: FormData, prefix: string): Promise<{ key: string; name: string } | { error: string }> {
	const file = formData.get('file');
	if (!(file instanceof File) || file.size === 0) return { error: 'Choose an image.' };
	const bytes = new Uint8Array(await file.arrayBuffer());
	const check = validateUpload(bytes, 'image', PROJECT_IMAGE_MAX_BYTES);
	if (!check.ok) return { error: `${file.name}: ${check.error}` };
	const result = storageOrError();
	if ('error' in result) return result;
	const key = buildKey(prefix, check.ext);
	await result.storage.put(key, bytes, check.contentType);
	return { key, name: file.name };
}

export async function uploadPostCover(formData: FormData): Promise<PostMediaResult> {
	await requireAdmin();
	const postId = id.parse(formData.get('postId'));
	const repo = postRepository();
	if (!(await repo.getPost(postId))) return { error: 'Post not found.' };

	const stored = await storeImage(formData, `posts/${postId}/cover`);
	if ('error' in stored) return stored;
	await deleteStoredFiles([await repo.setPostCover(postId, stored.key)]);
	updateTag(POSTS_TAG);
	return {};
}

export async function removePostCover(postId: number): Promise<PostMediaResult> {
	await requireAdmin();
	await deleteStoredFiles([await postRepository().setPostCover(id.parse(postId), null)]);
	updateTag(POSTS_TAG);
	return {};
}

/** Uploads an image for the body; returns the Markdown to insert. */
export async function uploadPostImage(formData: FormData): Promise<PostMediaResult> {
	await requireAdmin();
	const postId = id.parse(formData.get('postId'));
	const repo = postRepository();
	if (!(await repo.getPost(postId))) return { error: 'Post not found.' };

	const stored = await storeImage(formData, `posts/${postId}/img`);
	if ('error' in stored) return stored;
	await repo.addPostImage(postId, stored.key);
	return { markdown: imageMarkdown(stored.key, stored.name) };
}

/** Refuses to delete an image the saved body still references (it would break the post). */
export async function deletePostImage(postId: number, imageId: number): Promise<PostMediaResult> {
	await requireAdmin();
	const repo = postRepository();
	const [post, images] = await Promise.all([repo.getPost(id.parse(postId)), repo.listPostImages(id.parse(postId))]);
	const image = images.find((i) => i.id === id.parse(imageId));
	if (!post || !image) return { error: 'Image not found.' };

	const usedIn = LOCALES.filter((l) => referencedUploadKeys(post.translations[l]?.body ?? '').includes(image.key));
	if (usedIn.length > 0) {
		return { error: `This image is still used in the ${usedIn.join(' and ')} body. Remove it from the text and save first.` };
	}
	await deleteStoredFiles([await repo.removePostImage(post.id, image.id)]);
	return {};
}
