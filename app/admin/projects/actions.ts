'use server';

import { updateTag } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { requireAdmin } from '@/app/lib/auth/admin';
import { parseProjectForm } from '@/app/lib/content/projects/project';
import { PROJECTS_TAG, projectRepository } from '@/app/lib/content/projects/project-service';

export type SaveProjectState = { ok?: boolean; errors?: Record<string, string> };

const idSchema = z.coerce.number().int().positive();

/** Creates (no `id` field) or updates (with `id`) a project. */
export async function saveProject(_prev: SaveProjectState, formData: FormData): Promise<SaveProjectState> {
	await requireAdmin();

	const parsed = parseProjectForm(Object.fromEntries(formData));
	if (!parsed.ok) return { errors: parsed.errors };

	const rawId = formData.get('id');
	const id = rawId ? idSchema.parse(rawId) : null;
	const repo = projectRepository();

	// Friendly error instead of a unique-constraint crash.
	const sameSlug = await repo.getProjectBySlug(parsed.value.slug);
	if (sameSlug && sameSlug.id !== id) {
		return { errors: { slug: `“${parsed.value.slug}” is already used by another project.` } };
	}

	if (id) {
		await repo.updateProject(id, parsed.value);
		updateTag(PROJECTS_TAG);
		return { ok: true };
	}

	await repo.createProject(parsed.value);
	updateTag(PROJECTS_TAG);
	redirect('/admin/projects');
}

export async function deleteProject(formData: FormData): Promise<void> {
	await requireAdmin();
	await projectRepository().deleteProject(idSchema.parse(formData.get('id')));
	updateTag(PROJECTS_TAG);
}

export async function reorderProjects(ids: number[]): Promise<void> {
	await requireAdmin();
	const parsed = z.array(idSchema).max(500).parse(ids);
	await projectRepository().reorderProjects(parsed);
	updateTag(PROJECTS_TAG);
}
