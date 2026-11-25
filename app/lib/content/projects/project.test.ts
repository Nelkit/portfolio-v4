import { describe, expect, it } from 'vitest';
import { parseProjectForm, PROJECT_LINK_LABELS, slugify, toProjectView, type ProjectRecord, type ProjectTranslation } from './project';

const validFields = {
	slug: '',
	organisation: ' Acme ',
	year: '2024',
	areaId: '1',
	title_en: 'Mobile Banking App',
	title_es: 'App de Banca Móvil',
	summary_en: 'A banking app.',
	summary_es: 'Una app bancaria.',
	description_en: '## Overview\n\nBuilt with **Swift**.',
	description_es: '## Resumen\n\nHecha con **Swift**.',
	links: JSON.stringify([{ type: 'github', label: 'code', url: 'https://github.com/acme/app' }]),
	skills: JSON.stringify(['Swift', ' CoreML ', 'swift']),
};

describe('slugify', () => {
	it('lowercases, strips accents and joins words with dashes', () => {
		expect(slugify('Mi Aplicación Móvil')).toBe('mi-aplicacion-movil');
		expect(slugify('  Hello, World!  ')).toBe('hello-world');
		expect(slugify('C++ & Swift — 2024')).toBe('c-swift-2024');
	});
});

describe('parseProjectForm', () => {
	it('reads the screenshots position and defaults to bottom', () => {
		for (const [raw, expected] of [['top', 'top'], ['bottom', 'bottom'], [undefined, 'bottom']] as const) {
			const result = parseProjectForm({ ...validFields, screenshotsPosition: raw });
			if (!result.ok) throw new Error('expected ok');
			expect(result.value.screenshotsPosition).toBe(expected);
		}
	});

	it('rejects an unknown screenshots position', () => {
		const result = parseProjectForm({ ...validFields, screenshotsPosition: 'left' });
		expect(result.ok).toBe(false);
		if (!result.ok) expect(result.errors.screenshotsPosition).toBeDefined();
	});

	it('accepts a complete bilingual project and trims values', () => {
		const result = parseProjectForm({ ...validFields, slug: 'banking' });
		expect(result.ok).toBe(true);
		if (!result.ok) return;
		expect(result.value.slug).toBe('banking');
		expect(result.value.organisation).toBe('Acme');
		expect(result.value.year).toBe(2024);
		expect(result.value.translations.es.title).toBe('App de Banca Móvil');
		expect(result.value.links).toHaveLength(1);
	});

	it('derives the slug from the English title when left empty', () => {
		const result = parseProjectForm(validFields);
		if (!result.ok) throw new Error('expected ok');
		expect(result.value.slug).toBe('mobile-banking-app');
	});

	it('rejects a slug with invalid characters', () => {
		const result = parseProjectForm({ ...validFields, slug: 'Bad Slug!' });
		expect(result.ok).toBe(false);
		if (!result.ok) expect(result.errors.slug).toBeDefined();
	});

	it('requires a title and summary in every language', () => {
		const result = parseProjectForm({ ...validFields, title_es: ' ', summary_en: '' });
		expect(result.ok).toBe(false);
		if (!result.ok) expect(Object.keys(result.errors).sort()).toEqual(['summary_en', 'title_es']);
	});

	it('allows an empty description, organisation and year', () => {
		const result = parseProjectForm({ ...validFields, description_en: '', organisation: '', year: '' });
		expect(result.ok).toBe(true);
		if (result.ok) {
			expect(result.value.translations.en.description).toBe('');
			expect(result.value.organisation).toBe('');
			expect(result.value.year).toBeNull();
		}
	});

	it('rejects a year that is not a plausible 4-digit year', () => {
		for (const year of ['20', '3000', 'abc', '2024.5']) {
			const result = parseProjectForm({ ...validFields, year });
			expect(result.ok).toBe(false);
			if (!result.ok) expect(result.errors.year).toBeDefined();
		}
	});

	it('requires a category (area): a missing or invalid id is an error', () => {
		const some = parseProjectForm({ ...validFields, areaId: '3' });
		expect(some.ok && some.value.areaId).toBe(3);
		for (const areaId of ['', 'abc', undefined]) {
			const result = parseProjectForm({ ...validFields, areaId });
			expect(result.ok).toBe(false);
			if (!result.ok) expect(result.errors.areaId).toBeDefined();
		}
	});

	it('parses featured (checkbox) and its order', () => {
		const off = parseProjectForm(validFields);
		expect(off.ok && off.value).toMatchObject({ featured: false, featuredOrder: 0 });
		const on = parseProjectForm({ ...validFields, featured: 'on', featuredOrder: '2' });
		expect(on.ok && on.value).toMatchObject({ featured: true, featuredOrder: 2 });
		const bad = parseProjectForm({ ...validFields, featuredOrder: '-1' });
		expect(bad.ok).toBe(false);
		if (!bad.ok) expect(bad.errors.featuredOrder).toBeDefined();
	});

	it('parses the optional per-language card and detail fields', () => {
		const result = parseProjectForm({
			...validFields,
			keyResult_en: ' 40% faster ',
			role_es: 'Líder de frontend',
			howItWorks_en: 'Pipeline',
			results_es: 'Resultados',
			myRole_en: 'I led the UI.',
		});
		if (!result.ok) throw new Error('expected ok');
		expect(result.value.translations.en).toMatchObject({ keyResult: '40% faster', role: '', howItWorks: 'Pipeline', myRole: 'I led the UI.' });
		expect(result.value.translations.es).toMatchObject({ keyResult: '', role: 'Líder de frontend', results: 'Resultados' });
	});

	it('parses the ordered skills, trimmed and without case-insensitive duplicates', () => {
		const result = parseProjectForm(validFields);
		expect(result.ok && result.value.skills).toEqual(['Swift', 'CoreML']);
		expect(parseProjectForm({ ...validFields, skills: undefined }).ok).toBe(true);
		const bad = parseProjectForm({ ...validFields, skills: '{oops' });
		expect(bad.ok).toBe(false);
		if (!bad.ok) expect(bad.errors.skills).toBeDefined();
	});

	it('validates project links like profile links', () => {
		const links = JSON.stringify([{ type: 'link', label: 'live-demo', url: 'ftp://nope' }]);
		const result = parseProjectForm({ ...validFields, links });
		expect(result.ok).toBe(false);
		if (!result.ok) expect(result.errors.links).toBeDefined();
	});

	it('only accepts the standard link labels', () => {
		expect(PROJECT_LINK_LABELS).toEqual(['live-demo', 'video-demo', 'code', 'api-docs', 'app-store', 'website', 'github-org']);
		const links = JSON.stringify([{ type: 'github', label: 'Code (frontend)', url: 'https://github.com/a/b' }]);
		const result = parseProjectForm({ ...validFields, links });
		expect(result.ok).toBe(false);
		if (!result.ok) expect(result.errors.links).toBeDefined();
	});
});

describe('toProjectView', () => {
	const url = (key: string) => `https://cdn.test/${key}`;
	const translation = (title: string, suffix: string): ProjectTranslation => ({
		title,
		summary: `S-${suffix}`,
		description: `D-${suffix}`,
		keyResult: `K-${suffix}`,
		role: `R-${suffix}`,
		howItWorks: '',
		results: '',
		myRole: '',
	});
	const record: ProjectRecord = {
		id: 7,
		slug: 'banking',
		organisation: 'Acme',
		year: 2024,
		areaId: 2,
		featured: true,
		featuredOrder: 3,
		screenshotsPosition: 'top',
		skills: ['Swift', 'CoreML'],
		imageKey: 'projects/7/cover-a.webp',
		screenshots: [
			{ id: 1, key: 'projects/7/shot-1.png' },
			{ id: 2, key: 'projects/7/shot-2.png' },
		],
		translations: { en: translation('Banking', 'en'), es: translation('Banca', 'es') },
		links: [
			{ type: 'github', label: 'code', url: 'https://github.com/acme/app' },
			{ type: 'link', label: 'live-demo', url: 'https://acme.app' },
		],
	};

	it('picks the requested language, including the card fields', () => {
		expect(toProjectView(record, 'es', url)).toMatchObject({ slug: 'banking', title: 'Banca', summary: 'S-es', description: 'D-es', keyResult: 'K-es', role: 'R-es' });
	});

	it('falls back to the other language when one is missing', () => {
		const onlyEn = { ...record, translations: { en: record.translations.en } };
		expect(toProjectView(onlyEn, 'es', url)?.title).toBe('Banking');
	});

	it('exposes year, organisation and the featured flags', () => {
		expect(toProjectView(record, 'en', url)).toMatchObject({ year: 2024, organisation: 'Acme', featured: true, featuredOrder: 3 });
	});

	it('keeps the link label keys (translated by the page) and marks links as external', () => {
		const view = toProjectView(record, 'en', url);
		expect(view?.links.map((l) => [l.label, l.isExternal])).toEqual([['code', true], ['live-demo', true]]);
	});

	it('resolves the main image and screenshots (in order) to public URLs', () => {
		const view = toProjectView(record, 'en', url);
		expect(view?.imageUrl).toBe('https://cdn.test/projects/7/cover-a.webp');
		expect(view?.screenshots).toEqual(['https://cdn.test/projects/7/shot-1.png', 'https://cdn.test/projects/7/shot-2.png']);
	});

	it('shows the name of its area, or none when the area is unknown', () => {
		const areas = [{ id: 2, name: 'Móvil' }];
		expect(toProjectView(record, 'es', url, areas)?.area).toEqual({ id: 2, name: 'Móvil' });
		expect(toProjectView(record, 'es', url, [])?.area).toBeNull();
	});

	it('exposes the skills in order', () => {
		expect(toProjectView(record, 'en', url)?.skills).toEqual(['Swift', 'CoreML']);
	});

	it('has no image URL when the project has no image', () => {
		expect(toProjectView({ ...record, imageKey: null, screenshots: [] }, 'en', url)).toMatchObject({ imageUrl: null, screenshots: [] });
	});
});
