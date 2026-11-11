import { cachedRead } from '@/app/lib/cache/cached-read';
import { getDb } from '@/app/lib/db/client';
import type { Locale } from '@/app/lib/i18n/locales';
import { publicUrlFor } from '@/app/lib/storage/storage';
import { AREAS_TAG, loadAreaViews } from '@/app/lib/content/areas/area-service';
import { toProjectView, type ProjectView } from './project';
import { createTursoProjectRepository } from './turso-project-repository';
import type { ProjectRepository } from './project-repository';

/** Cache tag for every public read of projects; invalidated on any admin change. */
export const PROJECTS_TAG = 'projects';

export function projectRepository(): ProjectRepository {
	return createTursoProjectRepository(getDb());
}

/** All projects for one language, in display order. Also shows area names → both tags. */
export const getPublishedProjects = cachedRead(
	async (locale: Locale): Promise<ProjectView[]> => {
		const [records, areas] = await Promise.all([projectRepository().listProjects(), loadAreaViews(locale)]);
		return records
			.map((record) => toProjectView(record, locale, publicUrlFor, areas))
			.filter((view): view is ProjectView => view !== null);
	},
	['projects'],
	[PROJECTS_TAG, AREAS_TAG],
);

export const getPublishedProject = cachedRead(
	async (locale: Locale, slug: string): Promise<ProjectView | null> => {
		const [record, areas] = await Promise.all([projectRepository().getProjectBySlug(slug), loadAreaViews(locale)]);
		return record ? toProjectView(record, locale, publicUrlFor, areas) : null;
	},
	['project'],
	[PROJECTS_TAG, AREAS_TAG],
);
