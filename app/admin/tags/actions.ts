'use server';

import { updateTag } from 'next/cache';
import { z } from 'zod';
import { requireAdmin } from '@/app/lib/auth/admin';
import { parseTagForm } from '@/app/lib/content/tags/tag';
import { TAGS_TAG, tagRepository } from '@/app/lib/content/tags/tag-service';

export type TagFormState = { ok?: boolean; errors?: Record<string, string> };

const id = z.coerce.number().int().positive();

/** Creates (no `id`) or renames (with `id`) a tag. */
export async function saveTag(_prev: TagFormState, formData: FormData): Promise<TagFormState> {
	await requireAdmin();
	const parsed = parseTagForm(Object.fromEntries(formData));
	if (!parsed.ok) return { errors: parsed.errors };

	const repo = tagRepository();
	const rawId = formData.get('id');
	const tagId = rawId ? id.parse(rawId) : null;
	const sameSlug = await repo.getTagBySlug(parsed.value.slug);
	if (sameSlug && sameSlug.id !== tagId) return { errors: { slug: `“${parsed.value.slug}” is already used by another tag.` } };

	if (tagId) await repo.updateTag(tagId, parsed.value);
	else await repo.createTag(parsed.value);
	updateTag(TAGS_TAG);
	return { ok: true };
}

/** Deleting a tag removes it from its posts; the posts are kept. */
export async function deleteTag(formData: FormData): Promise<void> {
	await requireAdmin();
	await tagRepository().deleteTag(id.parse(formData.get('id')));
	updateTag(TAGS_TAG);
}
