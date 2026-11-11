'use server';

import { updateTag } from 'next/cache';
import { z } from 'zod';
import { requireAdmin } from '@/app/lib/auth/admin';
import { parseAreaForm } from '@/app/lib/content/areas/area';
import { AREAS_TAG, areaRepository } from '@/app/lib/content/areas/area-service';

export type AreaFormState = { ok?: boolean; errors?: Record<string, string> };

const id = z.coerce.number().int().positive();

/** Creates (no `id`) or renames (with `id`) an area. */
export async function saveArea(_prev: AreaFormState, formData: FormData): Promise<AreaFormState> {
	await requireAdmin();
	const parsed = parseAreaForm(Object.fromEntries(formData));
	if (!parsed.ok) return { errors: parsed.errors };

	const repo = areaRepository();
	const rawId = formData.get('id');
	if (rawId) await repo.updateArea(id.parse(rawId), parsed.value);
	else await repo.createArea(parsed.value);

	updateTag(AREAS_TAG);
	return { ok: true };
}

/** Deleting an area keeps its projects (they end up without area). */
export async function deleteArea(formData: FormData): Promise<void> {
	await requireAdmin();
	await areaRepository().deleteArea(id.parse(formData.get('id')));
	updateTag(AREAS_TAG);
}

export async function reorderAreas(ids: number[]): Promise<void> {
	await requireAdmin();
	await areaRepository().reorderAreas(z.array(id).max(100).parse(ids));
	updateTag(AREAS_TAG);
}
