'use server';

import { updateTag } from 'next/cache';
import { z } from 'zod';
import { requireAdmin } from '@/app/lib/auth/admin';
import { parseEducationForm } from '@/app/lib/content/education/education';
import { EDUCATION_TAG, educationRepository } from '@/app/lib/content/education/education-service';

export type EducationFormState = { ok?: boolean; errors?: Record<string, string> };

const id = z.coerce.number().int().positive();

/** Creates (no `id`) or updates (with `id`) an education entry. */
export async function saveEducationEntry(_prev: EducationFormState, formData: FormData): Promise<EducationFormState> {
	await requireAdmin();
	const parsed = parseEducationForm(Object.fromEntries(formData));
	if (!parsed.ok) return { errors: parsed.errors };

	const repo = educationRepository();
	const rawId = formData.get('id');
	if (rawId) await repo.updateEntry(id.parse(rawId), parsed.value);
	else await repo.createEntry(parsed.value);

	updateTag(EDUCATION_TAG);
	return { ok: true };
}

export async function deleteEducationEntry(formData: FormData): Promise<void> {
	await requireAdmin();
	await educationRepository().deleteEntry(id.parse(formData.get('id')));
	updateTag(EDUCATION_TAG);
}
