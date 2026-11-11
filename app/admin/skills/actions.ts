'use server';

import { updateTag } from 'next/cache';
import { z } from 'zod';
import { requireAdmin } from '@/app/lib/auth/admin';
import { parseCategoryForm } from '@/app/lib/content/skills/skill-category';
import { SKILLS_TAG, skillCategoryRepository } from '@/app/lib/content/skills/skill-service';

export type CategoryFormState = { ok?: boolean; errors?: Record<string, string> };

const id = z.coerce.number().int().positive();

/** Creates (no `id`) or updates (with `id`) a tech-stack category and its skills. */
export async function saveCategory(_prev: CategoryFormState, formData: FormData): Promise<CategoryFormState> {
	await requireAdmin();
	const parsed = parseCategoryForm(Object.fromEntries(formData));
	if (!parsed.ok) return { errors: parsed.errors };

	const repo = skillCategoryRepository();
	const rawId = formData.get('id');
	if (rawId) await repo.updateCategory(id.parse(rawId), parsed.value);
	else await repo.createCategory(parsed.value);

	updateTag(SKILLS_TAG);
	return { ok: true };
}

export async function deleteCategory(formData: FormData): Promise<void> {
	await requireAdmin();
	await skillCategoryRepository().deleteCategory(id.parse(formData.get('id')));
	updateTag(SKILLS_TAG);
}

export async function reorderCategories(ids: number[]): Promise<void> {
	await requireAdmin();
	await skillCategoryRepository().reorderCategories(z.array(id).max(100).parse(ids));
	updateTag(SKILLS_TAG);
}
