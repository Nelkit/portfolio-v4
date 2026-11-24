import type { ProjectView } from './project';

/** Cards show at most this many tags; the detail page shows all of them. */
export const MAX_CARD_TAGS = 7;

/** "More projects" suggests at most this many. */
export const MAX_RELATED = 3;

export function cardTags(skills: string[]): string[] {
	return skills.slice(0, MAX_CARD_TAGS);
}

/** "YEAR · ORGANISATION", omitting whichever part is missing. */
export function projectMetaLine({ year, organisation }: Pick<ProjectView, 'year' | 'organisation'>): string {
	return [year ? String(year) : '', organisation.trim()].filter(Boolean).join(' · ');
}

const byFeaturedOrder = (a: ProjectView, b: ProjectView) => a.featuredOrder - b.featuredOrder;

/** Featured projects by featuredOrder; ties keep the display order (stable sort). */
export function featuredProjects(projects: ProjectView[]): ProjectView[] {
	return projects.filter((p) => p.featured).sort(byFeaturedOrder);
}

/**
 * Up to 3 suggestions: same category first (display order), then featured
 * projects (featuredOrder). Never the current project, never twice.
 */
export function relatedProjects(projects: ProjectView[], current: ProjectView): ProjectView[] {
	const others = projects.filter((p) => p.slug !== current.slug);
	const sameArea = current.area ? others.filter((p) => p.area?.id === current.area?.id) : [];
	const picked = [...sameArea, ...featuredProjects(others)];
	return picked.filter((p, i) => picked.findIndex((q) => q.slug === p.slug) === i).slice(0, MAX_RELATED);
}

export type ProjectSectionKey = 'overview' | 'howItWorks' | 'results' | 'myRole';
export type ProjectSection = { key: ProjectSectionKey; body: string };

/** Detail page sections with content, in their fixed order (Tech stack is rendered from the skills). */
export function projectSections(project: ProjectView): ProjectSection[] {
	const sections: ProjectSection[] = [
		{ key: 'overview', body: project.description.trim() },
		{ key: 'howItWorks', body: project.howItWorks.trim() },
		{ key: 'results', body: project.results.trim() },
		{ key: 'myRole', body: project.myRole.trim() },
	];
	return sections.filter((s) => s.body !== '' || (s.key === 'myRole' && project.role.trim() !== ''));
}
