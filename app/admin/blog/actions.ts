'use server';

import { updateTag } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { requireAdmin } from '@/app/lib/auth/admin';
import { parsePostForm } from '@/app/lib/content/posts/post';
import { POSTS_TAG, postRepository } from '@/app/lib/content/posts/post-service';

export type SavePostState = { ok?: boolean; errors?: Record<string, string> };

const idSchema = z.coerce.number().int().positive();

/** Creates (no `id`) or updates (with `id`) a blog post. */
export async function savePost(_prev: SavePostState, formData: FormData): Promise<SavePostState> {
	await requireAdmin();
	const parsed = parsePostForm(Object.fromEntries(formData));
	if (!parsed.ok) return { errors: parsed.errors };

	const rawId = formData.get('id');
	const id = rawId ? idSchema.parse(rawId) : null;
	const repo = postRepository();

	const sameSlug = await repo.getPostBySlug(parsed.value.slug);
	if (sameSlug && sameSlug.id !== id) {
		return { errors: { slug: `“${parsed.value.slug}” is already used by another post.` } };
	}

	if (id) {
		await repo.updatePost(id, parsed.value);
		updateTag(POSTS_TAG);
		return { ok: true };
	}

	const newId = await repo.createPost(parsed.value);
	updateTag(POSTS_TAG);
	redirect(`/admin/blog/${newId}`);
}

export async function deletePost(formData: FormData): Promise<void> {
	await requireAdmin();
	await postRepository().deletePost(idSchema.parse(formData.get('id')));
	updateTag(POSTS_TAG);
}
