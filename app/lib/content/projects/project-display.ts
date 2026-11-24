import type { ProjectView } from './project';

/** Cards show at most this many tags; the detail page shows all of them. */
export const MAX_CARD_TAGS = 7;

/** "More projects" suggests at most this many. */
export const MAX_RELATED = 3;

export function cardTags(skills: string[]): string[] {
	return skills.slice(0, MAX_CARD_TAGS);
}

/** Home card eyebrow: "01 · CATEGORY · YEAR", omitting whichever part is missing. */
export function cardEyebrow(index: number, { area, year }: Pick<ProjectView, 'area' | 'year'>): string {
	return [String(index + 1).padStart(2, '0'), area?.name ?? '', year ? String(year) : ''].filter(Boolean).join(' · ');
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

export type CardSize = 'full' | 'half' | 'third';

/** Width of a group of cards that share a row: 1 → full, 2 → halves, 3 → thirds. */
const rowOf = (count: number): CardSize[] => Array(count).fill(count === 1 ? 'full' : count === 2 ? 'half' : 'third');

/**
 * Home "Selected work" rows: the first card full width, the next two in halves,
 * the rest in thirds. A shorter last row widens its cards, so there is never
 * an empty slot.
 */
export function homeCardLayout(count: number): CardSize[] {
	const sizes: CardSize[] = [];
	if (count > 0) sizes.push('full');
	const second = Math.min(2, count - 1);
	if (second > 0) sizes.push(...rowOf(second));
	for (let i = 3; i < count; i += 3) sizes.push(...rowOf(Math.min(3, count - i)));
	return sizes;
}
