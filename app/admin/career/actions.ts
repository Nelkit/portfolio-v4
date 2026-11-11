'use server';

import { updateTag } from 'next/cache';
import { z } from 'zod';
import { requireAdmin } from '@/app/lib/auth/admin';
import { parseCareerForm } from '@/app/lib/content/career/career';
import { CAREER_TAG, careerRepository } from '@/app/lib/content/career/career-service';

export type CareerFormState = { ok?: boolean; errors?: Record<string, string> };

const id = z.coerce.number().int().positive();

/** Creates (no `id`) or updates (with `id`) a career entry. */
export async function saveCareerEntry(_prev: CareerFormState, formData: FormData): Promise<CareerFormState> {
	await requireAdmin();
	const parsed = parseCareerForm(Object.fromEntries(formData));
	if (!parsed.ok) return { errors: parsed.errors };

	const repo = careerRepository();
	const rawId = formData.get('id');
	if (rawId) await repo.updateEntry(id.parse(rawId), parsed.value);
	else await repo.createEntry(parsed.value);

	updateTag(CAREER_TAG);
	return { ok: true };
}

export async function deleteCareerEntry(formData: FormData): Promise<void> {
	await requireAdmin();
	await careerRepository().deleteEntry(id.parse(formData.get('id')));
	updateTag(CAREER_TAG);
}
