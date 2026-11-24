import { describe, expect, it } from 'vitest';
import {
	cardTags,
	featuredProjects,
	MAX_CARD_TAGS,
	projectMetaLine,
	projectSections,
	relatedProjects,
} from './project-display';
import type { ProjectView } from './project';

const view = (slug: string, patch: Partial<ProjectView> = {}): ProjectView => ({
	slug,
	organisation: '',
	year: null,
	title: slug,
	summary: '',
	description: '',
	keyResult: '',
	role: '',
	howItWorks: '',
	results: '',
	myRole: '',
	area: null,
	featured: false,
	featuredOrder: 0,
	skills: [],
	links: [],
	imageUrl: null,
	screenshots: [],
	...patch,
});

const ai = { id: 1, name: 'AI Products' };
const mobile = { id: 2, name: 'Mobile' };

describe('featuredProjects', () => {
	it('keeps only featured projects, sorted by featuredOrder', () => {
		const all = [
			view('c', { featured: true, featuredOrder: 3 }),
			view('x'),
			view('a', { featured: true, featuredOrder: 1 }),
			view('b', { featured: true, featuredOrder: 2 }),
		];
		expect(featuredProjects(all).map((p) => p.slug)).toEqual(['a', 'b', 'c']);
	});

	it('keeps the display order for featured projects with the same featuredOrder', () => {
		const all = [view('first', { featured: true }), view('second', { featured: true })];
		expect(featuredProjects(all).map((p) => p.slug)).toEqual(['first', 'second']);
	});
});

describe('relatedProjects', () => {
	it('suggests projects of the same category first, in display order', () => {
		const current = view('cur', { area: ai });
		const all = [current, view('m1', { area: mobile }), view('a1', { area: ai }), view('a2', { area: ai })];
		expect(relatedProjects(all, current).map((p) => p.slug)).toEqual(['a1', 'a2']);
	});

	it('fills with featured projects (by featuredOrder) when the category has fewer than 3', () => {
		const current = view('cur', { area: ai });
		const all = [
			current,
			view('a1', { area: ai }),
			view('f2', { area: mobile, featured: true, featuredOrder: 2 }),
			view('m1', { area: mobile }),
			view('f1', { area: mobile, featured: true, featuredOrder: 1 }),
		];
		expect(relatedProjects(all, current).map((p) => p.slug)).toEqual(['a1', 'f1', 'f2']);
	});

	it('returns at most 3 and never the current project or a duplicate', () => {
		const current = view('cur', { area: ai, featured: true, featuredOrder: 1 });
		const all = [
			current,
			view('a1', { area: ai, featured: true, featuredOrder: 2 }),
			view('a2', { area: ai }),
			view('a3', { area: ai }),
			view('a4', { area: ai }),
		];
		const related = relatedProjects(all, current);
		expect(related.map((p) => p.slug)).toEqual(['a1', 'a2', 'a3']);
	});

	it('returns fewer than 3 when there is nothing else to suggest', () => {
		const current = view('cur', { area: ai });
		expect(relatedProjects([current, view('m1', { area: mobile })], current)).toEqual([]);
	});
});

describe('cardTags', () => {
	it('shows at most the first 7 tags, in order', () => {
		const skills = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i'];
		expect(MAX_CARD_TAGS).toBe(7);
		expect(cardTags(skills)).toEqual(['a', 'b', 'c', 'd', 'e', 'f', 'g']);
		expect(cardTags(['a', 'b'])).toEqual(['a', 'b']);
	});
});

describe('projectMetaLine', () => {
	it('joins year and organisation with a middle dot', () => {
		expect(projectMetaLine({ year: 2026, organisation: 'UTS' })).toBe('2026 · UTS');
	});

	it('omits the missing part', () => {
		expect(projectMetaLine({ year: 2019, organisation: '' })).toBe('2019');
		expect(projectMetaLine({ year: null, organisation: 'Ryte' })).toBe('Ryte');
		expect(projectMetaLine({ year: null, organisation: '  ' })).toBe('');
	});
});

describe('projectSections', () => {
	it('lists only the sections with content, in the fixed order', () => {
		const p = view('p', { description: 'Intro', results: 'Good', howItWorks: '  ' });
		expect(projectSections(p)).toEqual([
			{ key: 'overview', body: 'Intro' },
			{ key: 'results', body: 'Good' },
		]);
	});

	it('orders overview, how it works, results and my role', () => {
		const p = view('p', { myRole: 'Lead', results: 'R', howItWorks: 'H', description: 'O' });
		expect(projectSections(p).map((s) => s.key)).toEqual(['overview', 'howItWorks', 'results', 'myRole']);
	});

	it('shows my role when only the short role is set', () => {
		const p = view('p', { role: 'Frontend Lead' });
		expect(projectSections(p)).toEqual([{ key: 'myRole', body: '' }]);
	});
});
