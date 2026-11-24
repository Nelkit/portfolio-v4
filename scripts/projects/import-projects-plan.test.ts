import { describe, expect, it } from 'vitest';
import type { ProjectRecord } from '@/app/lib/content/projects/project';
import { buildProjectInput, findArea, linkLabelKey, pairEntries, type ProjectEntry } from './import-projects-plan';

const entry = (slug: string, patch: Partial<ProjectEntry> = {}): ProjectEntry => ({
	slug,
	category: 'AI Products',
	organisation: 'UTS',
	year: 2026,
	featured: true,
	featuredOrder: 1,
	techStack: ['Next.js', 'Python'],
	links: [{ type: 'github', label: 'Code', url: 'https://github.com/x/y' }],
	title: `${slug} title`,
	summary: `${slug} summary`,
	keyResult: 'Key',
	role: 'Lead',
	overview: 'Overview',
	howItWorks: 'How',
	results: 'Results',
	myRole: 'Mine',
	...patch,
});

const record = (patch: Partial<ProjectRecord> = {}): ProjectRecord => ({
	id: 7,
	slug: 'p',
	organisation: 'Old org',
	year: 2020,
	areaId: 1,
	featured: false,
	featuredOrder: 0,
	skills: ['Old'],
	links: [],
	translations: {
		en: { title: 'Old', summary: 'Old s', description: 'Old d', keyResult: '', role: '', howItWorks: '', results: '', myRole: '' },
		es: { title: 'Viejo', summary: 'Viejo s', description: 'Viejo d', keyResult: '', role: '', howItWorks: '', results: '', myRole: '' },
	},
	imageKey: 'img.png',
	screenshots: [],
	...patch,
});

describe('linkLabelKey', () => {
	it('maps the display labels to the standard keys', () => {
		expect(linkLabelKey('Live demo')).toBe('live-demo');
		expect(linkLabelKey('API docs')).toBe('api-docs');
		expect(linkLabelKey('Code')).toBe('code');
		expect(linkLabelKey('App Store')).toBe('app-store');
		expect(linkLabelKey('Website')).toBe('website');
		expect(linkLabelKey('GitHub org')).toBe('github-org');
		expect(linkLabelKey('github-org')).toBe('github-org');
	});

	it('returns null for a label that is not standard', () => {
		expect(linkLabelKey('Demo video')).toBeNull();
	});
});

describe('pairEntries', () => {
	it('pairs the EN and ES entries by slug', () => {
		const { pairs, problems } = pairEntries([entry('a')], [entry('a', { title: 'A es' })]);
		expect(problems).toEqual([]);
		expect(pairs).toHaveLength(1);
		expect(pairs[0].en.title).toBe('a title');
		expect(pairs[0].es.title).toBe('A es');
	});

	it('reports a slug that is only in one file', () => {
		const { problems } = pairEntries([entry('a'), entry('b')], [entry('a')]);
		expect(problems).toEqual(['"b" is in projects-en.json but not in projects-es.json']);
	});

	it('reports shared fields that differ between the files', () => {
		const { problems } = pairEntries([entry('a')], [entry('a', { year: 2025 })]);
		expect(problems).toEqual(['"a": "year" differs between the EN and ES files']);
	});

	it('reports a duplicated slug', () => {
		const { problems } = pairEntries([entry('a'), entry('a')], [entry('a')]);
		expect(problems).toContain('"a" appears more than once in projects-en.json');
	});
});

describe('findArea', () => {
	const areas = [
		{ id: 1, translations: { en: { name: 'AI Products' }, es: { name: 'Productos de IA' } } },
		{ id: 2, translations: { en: { name: 'Mobile' }, es: { name: 'Móvil' } } },
	];

	it('finds a category by its English or Spanish name, ignoring case', () => {
		expect(findArea(areas, 'ai products')?.id).toBe(1);
		expect(findArea(areas, 'Móvil')?.id).toBe(2);
	});

	it('returns undefined when the category does not exist', () => {
		expect(findArea(areas, 'Data Engineering')).toBeUndefined();
	});
});

describe('buildProjectInput', () => {
	const pair = { slug: 'p', en: entry('p'), es: entry('p', { title: 'p es', overview: 'Resumen' }) };

	it('builds a new project from the JSON, mapping overview to description and labels to keys', () => {
		const result = buildProjectInput(null, pair, 3);
		expect(result.ok).toBe(true);
		if (!result.ok) return;
		expect(result.value).toMatchObject({
			slug: 'p',
			areaId: 3,
			organisation: 'UTS',
			year: 2026,
			featured: true,
			featuredOrder: 1,
			skills: ['Next.js', 'Python'],
			links: [{ type: 'github', label: 'code', url: 'https://github.com/x/y' }],
		});
		expect(result.value.translations.en).toEqual({
			title: 'p title',
			summary: 'p summary',
			description: 'Overview',
			keyResult: 'Key',
			role: 'Lead',
			howItWorks: 'How',
			results: 'Results',
			myRole: 'Mine',
		});
		expect(result.value.translations.es.description).toBe('Resumen');
	});

	it('overwrites only the fields the JSON has and keeps the rest of the existing project', () => {
		const partial = {
			slug: 'p',
			en: { slug: 'p', summary: 'New summary' } as ProjectEntry,
			es: { slug: 'p', summary: 'Nuevo resumen' } as ProjectEntry,
		};
		const result = buildProjectInput(record(), partial, 1);
		expect(result.ok).toBe(true);
		if (!result.ok) return;
		expect(result.value).toMatchObject({ organisation: 'Old org', year: 2020, areaId: 1, skills: ['Old'], featured: false });
		expect(result.value.translations.en).toMatchObject({ title: 'Old', summary: 'New summary', description: 'Old d' });
		expect(result.value.translations.es).toMatchObject({ title: 'Viejo', summary: 'Nuevo resumen' });
	});

	it('treats a null featuredOrder as 0', () => {
		const result = buildProjectInput(null, { slug: 'p', en: entry('p', { featured: false, featuredOrder: null }), es: entry('p', { featured: false, featuredOrder: null }) }, 1);
		expect(result.ok && result.value.featuredOrder).toBe(0);
	});

	it('applies the admin form rules and reports every error', () => {
		const bad = {
			slug: 'p',
			en: entry('p', { title: '', links: [{ type: 'link', label: 'Demo video', url: 'https://x.dev' }] }),
			es: entry('p', { summary: 'x'.repeat(301) }),
		};
		const result = buildProjectInput(null, bad, 1);
		expect(result.ok).toBe(false);
		if (result.ok) return;
		expect(result.errors).toMatchObject({ title_en: 'Required', summary_es: 'Max 300 characters' });
		expect(result.errors.links).toContain('Demo video');
	});

	it('requires the core fields when the project is new', () => {
		const result = buildProjectInput(null, { slug: 'p', en: { slug: 'p' } as ProjectEntry, es: { slug: 'p' } as ProjectEntry }, 1);
		expect(result.ok).toBe(false);
		if (result.ok) return;
		expect(result.errors).toMatchObject({ title_en: 'Required', summary_en: 'Required', title_es: 'Required' });
	});
});
