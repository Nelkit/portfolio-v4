import { describe, expect, it } from 'vitest';
import { parseProjectForm, slugify, toProjectView, type ProjectRecord } from './project';

const validFields = {
	slug: '',
	company: ' Acme ',
	title_en: 'Mobile Banking App',
	title_es: 'App de Banca Móvil',
	summary_en: 'A banking app.',
	summary_es: 'Una app bancaria.',
	description_en: '## Overview\n\nBuilt with **Swift**.',
	description_es: '## Resumen\n\nHecha con **Swift**.',
	links: JSON.stringify([{ type: 'github', label: 'Code', url: 'https://github.com/acme/app' }]),
};

describe('slugify', () => {
	it('lowercases, strips accents and joins words with dashes', () => {
		expect(slugify('Mi Aplicación Móvil')).toBe('mi-aplicacion-movil');
		expect(slugify('  Hello, World!  ')).toBe('hello-world');
		expect(slugify('C++ & Swift — 2024')).toBe('c-swift-2024');
	});
});

describe('parseProjectForm', () => {
	it('accepts a complete bilingual project and trims values', () => {
		const result = parseProjectForm({ ...validFields, slug: 'banking' });
		expect(result.ok).toBe(true);
		if (!result.ok) return;
		expect(result.value.slug).toBe('banking');
		expect(result.value.company).toBe('Acme');
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

	it('allows an empty description and an empty company', () => {
		const result = parseProjectForm({ ...validFields, description_en: '', company: '' });
		expect(result.ok).toBe(true);
		if (result.ok) {
			expect(result.value.translations.en.description).toBe('');
			expect(result.value.company).toBe('');
		}
	});

	it('validates project links like profile links', () => {
		const links = JSON.stringify([{ type: 'link', label: 'Demo', url: 'ftp://nope' }]);
		const result = parseProjectForm({ ...validFields, links });
		expect(result.ok).toBe(false);
		if (!result.ok) expect(result.errors.links).toBeDefined();
	});
});

describe('toProjectView', () => {
	const url = (key: string) => `https://cdn.test/${key}`;
	const record: ProjectRecord = {
		id: 7,
		slug: 'banking',
		company: 'Acme',
		imageKey: 'projects/7/cover-a.webp',
		screenshots: [
			{ id: 1, key: 'projects/7/shot-1.png' },
			{ id: 2, key: 'projects/7/shot-2.png' },
		],
		translations: {
			en: { title: 'Banking', summary: 'S-en', description: 'D-en' },
			es: { title: 'Banca', summary: 'S-es', description: 'D-es' },
		},
		links: [
			{ type: 'github', label: 'Code', url: 'https://github.com/acme/app' },
			{ type: 'email', label: 'Mail', url: 'mailto:a@b.co' },
		],
	};

	it('picks the requested language', () => {
		expect(toProjectView(record, 'es', url)).toMatchObject({ slug: 'banking', title: 'Banca', summary: 'S-es', description: 'D-es' });
	});

	it('falls back to the other language when one is missing', () => {
		const onlyEn = { ...record, translations: { en: record.translations.en } };
		expect(toProjectView(onlyEn, 'es', url)?.title).toBe('Banking');
	});

	it('marks email links as internal and the rest as external', () => {
		const view = toProjectView(record, 'en', url);
		expect(view?.links.map((l) => l.isExternal)).toEqual([true, false]);
	});

	it('resolves the main image and screenshots (in order) to public URLs', () => {
		const view = toProjectView(record, 'en', url);
		expect(view?.imageUrl).toBe('https://cdn.test/projects/7/cover-a.webp');
		expect(view?.screenshots).toEqual(['https://cdn.test/projects/7/shot-1.png', 'https://cdn.test/projects/7/shot-2.png']);
	});

	it('has no image URL when the project has no image', () => {
		expect(toProjectView({ ...record, imageKey: null, screenshots: [] }, 'en', url)).toMatchObject({ imageUrl: null, screenshots: [] });
	});
});
