'use server';

import { updateTag } from 'next/cache';
import { z } from 'zod';
import { requireAdmin } from '@/app/lib/auth/admin';
import { MAX_SCREENSHOTS } from '@/app/lib/content/projects/project';
import { PROJECTS_TAG, projectRepository } from '@/app/lib/content/projects/project-service';
import { PROJECT_IMAGE_MAX_BYTES, validateUpload } from '@/app/lib/storage/file-validation';
import { buildKey } from '@/app/lib/storage/storage';
import { deleteStoredFiles as deleteFiles, storageOrError } from '@/app/lib/storage/cleanup';

/**
 * Project images are managed one file per request (each well under the 4 MB
 * Server Action limit) and attached to the project immediately, so an
 * abandoned form never leaves orphan files behind.
 */
export type MediaResult = { error?: string };

const id = z.coerce.number().int().positive();

/** Validates the uploaded image and stores it under `prefix`; returns its key. */
async function storeImage(formData: FormData, prefix: string): Promise<{ key: string } | { error: string }> {
	const file = formData.get('file');
	if (!(file instanceof File) || file.size === 0) return { error: 'Choose an image.' };
	const bytes = new Uint8Array(await file.arrayBuffer());
	const check = validateUpload(bytes, 'image', PROJECT_IMAGE_MAX_BYTES);
	if (!check.ok) return { error: `${file.name}: ${check.error}` };

	const result = storageOrError();
	if ('error' in result) return result;
	const key = buildKey(prefix, check.ext);
	await result.storage.put(key, bytes, check.contentType);
	return { key };
}

export async function uploadProjectImage(formData: FormData): Promise<MediaResult> {
	await requireAdmin();
	const projectId = id.parse(formData.get('projectId'));
	const repo = projectRepository();
	if (!(await repo.getProject(projectId))) return { error: 'Project not found.' };

	const stored = await storeImage(formData, `projects/${projectId}/cover`);
	if ('error' in stored) return stored;

	const previous = await repo.setProjectImage(projectId, stored.key);
	await deleteFiles([previous]);
	updateTag(PROJECTS_TAG);
	return {};
}

export async function removeProjectImage(projectId: number): Promise<MediaResult> {
	await requireAdmin();
	const previous = await projectRepository().setProjectImage(id.parse(projectId), null);
	await deleteFiles([previous]);
	updateTag(PROJECTS_TAG);
	return {};
}

export async function addProjectScreenshot(formData: FormData): Promise<MediaResult> {
	await requireAdmin();
	const projectId = id.parse(formData.get('projectId'));
	const repo = projectRepository();
	const project = await repo.getProject(projectId);
	if (!project) return { error: 'Project not found.' };
	if (project.screenshots.length >= MAX_SCREENSHOTS) return { error: `Max ${MAX_SCREENSHOTS} screenshots.` };

	const stored = await storeImage(formData, `projects/${projectId}/shot`);
	if ('error' in stored) return stored;

	await repo.addScreenshot(projectId, stored.key);
	updateTag(PROJECTS_TAG);
	return {};
}

export async function removeProjectScreenshot(projectId: number, screenshotId: number): Promise<MediaResult> {
	await requireAdmin();
	const key = await projectRepository().removeScreenshot(id.parse(projectId), id.parse(screenshotId));
	await deleteFiles([key]);
	updateTag(PROJECTS_TAG);
	return {};
}

export async function reorderProjectScreenshots(projectId: number, screenshotIds: number[]): Promise<MediaResult> {
	await requireAdmin();
	const ids = z.array(id).max(MAX_SCREENSHOTS).parse(screenshotIds);
	await projectRepository().reorderScreenshots(id.parse(projectId), ids);
	updateTag(PROJECTS_TAG);
	return {};
}
