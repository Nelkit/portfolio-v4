import { unstable_cache } from 'next/cache';
import { getDb } from '@/app/lib/db/client';
import type { Locale } from '@/app/lib/i18n/locales';
import { publicUrlFor } from '@/app/lib/storage/storage';
import { toProjectView, type ProjectView } from './project';
import { createTursoProjectRepository } from './turso-project-repository';
import type { ProjectRepository } from './project-repository';

/** Cache tag for every public read of projects; invalidated on any admin change. */
export const PROJECTS_TAG = 'projects';

export function projectRepository(): ProjectRepository {
	return createTursoProjectRepository(getDb());
}

/** All projects for one language, in display order. */
export const getPublishedProjects = unstable_cache(
	async (locale: Locale): Promise<ProjectView[]> =>
		(await projectRepository().listProjects())
			.map((record) => toProjectView(record, locale, publicUrlFor))
			.filter((view): view is ProjectView => view !== null),
	['projects'],
	{ tags: [PROJECTS_TAG] },
);

export const getPublishedProject = unstable_cache(
	async (locale: Locale, slug: string): Promise<ProjectView | null> => {
		const record = await projectRepository().getProjectBySlug(slug);
		return record ? toProjectView(record, locale, publicUrlFor) : null;
	},
	['project'],
	{ tags: [PROJECTS_TAG] },
);
