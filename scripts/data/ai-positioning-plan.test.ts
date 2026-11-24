import { describe, expect, it } from 'vitest';
import {
	AREA_PLAN,
	linkLabelFor,
	normaliseSkills,
	PROJECT_PLAN,
	splitSections,
} from './ai-positioning-plan';

describe('linkLabelFor', () => {
	it('maps every label in the current data to a standard label', () => {
		expect(linkLabelFor('Live Demo')).toBe('live-demo');
		expect(linkLabelFor('API docs')).toBe('api-docs');
		expect(linkLabelFor('Code (GitHub org)')).toBe('github-org');
		expect(linkLabelFor('Code (frontend)')).toBe('code');
		expect(linkLabelFor('Repo')).toBe('code');
		expect(linkLabelFor('Github Repo')).toBe('code');
		expect(linkLabelFor('Project Website')).toBe('website');
		expect(linkLabelFor('App In Appstore')).toBe('app-store');
		expect(linkLabelFor('CocoaPods Pod')).toBe('website');
	});

	it('keeps labels that are already standard (idempotent)', () => {
		expect(linkLabelFor('live-demo')).toBe('live-demo');
		expect(linkLabelFor('github-org')).toBe('github-org');
	});

	it('returns null for a label it does not know, so nothing is guessed', () => {
		expect(linkLabelFor('Slides')).toBeNull();
	});
});

describe('normaliseSkills', () => {
	it('renames NextJS, ReactJS and Github and drops duplicates (keeping the first position)', () => {
		expect(normaliseSkills(['Next.js', 'ReactJS', 'NextJS', 'Github'])).toEqual(['Next.js', 'React', 'GitHub']);
	});

	it('appends extra skills that are missing, ignoring case', () => {
		expect(normaliseSkills(['Python', 'postgresql'], ['PostgreSQL', 'PostGIS'])).toEqual(['Python', 'postgresql', 'PostGIS']);
	});

	it('removes skills', () => {
		expect(normaliseSkills(['Swift', 'SwiftUI', 'UIKit'], [], ['SwiftUI'])).toEqual(['Swift', 'UIKit']);
	});
});

describe('splitSections', () => {
	const en = [
		'Intro paragraph.',
		'',
		'Second paragraph.',
		'',
		'## How it works',
		'1. Step',
		'',
		'## Results',
		'- Good',
		'',
		'## My role: Frontend Lead',
		'- Built the UI',
	].join('\n');

	it('splits the Markdown into overview, sections and the role from the heading', () => {
		expect(splitSections(en, 'en')).toEqual({
			description: 'Intro paragraph.\n\nSecond paragraph.',
			howItWorks: '1. Step',
			results: '- Good',
			myRole: '- Built the UI',
			role: 'Frontend Lead',
		});
	});

	it('understands the Spanish headings', () => {
		const es = 'Intro.\n\n## Cómo funciona\nPaso\n\n## Resultados\nBien\n\n## Mi rol: Frontend Lead\nUI';
		expect(splitSections(es, 'es')).toEqual({
			description: 'Intro.',
			howItWorks: 'Paso',
			results: 'Bien',
			myRole: 'UI',
			role: 'Frontend Lead',
		});
	});

	it('returns null when there is nothing to split (already split, or plain text)', () => {
		expect(splitSections('Just an overview.', 'en')).toBeNull();
	});

	it('returns null when an unknown H2 is present, so no text is lost', () => {
		expect(splitSections('Intro\n\n## How it works\nA\n\n## Challenges\nB', 'en')).toBeNull();
	});
});

describe('the plan', () => {
	it('covers the 13 projects, each with a category, a year and an organisation', () => {
		expect(Object.keys(PROJECT_PLAN)).toHaveLength(13);
		for (const plan of Object.values(PROJECT_PLAN)) {
			expect(AREA_PLAN.map((a) => a.key)).toContain(plan.area);
			expect(plan.year).toBeGreaterThan(2000);
			expect(plan.organisation).not.toBe('');
		}
	});

	it('features exactly the six projects in the requested order', () => {
		const featured = Object.entries(PROJECT_PLAN)
			.filter(([, p]) => p.featuredOrder !== undefined)
			.sort(([, a], [, b]) => a.featuredOrder! - b.featuredOrder!)
			.map(([slug]) => slug);
		expect(featured).toEqual([
			'horus-cctv-video-search',
			'sydney-liveability-ai',
			'agromapas-cartographic-viewer',
			'ryte-2-0',
			'crypto-price-prediction-dashboard',
			'australia-liveability-gap',
		]);
	});

	it('orders the categories as requested, each with both languages', () => {
		expect(AREA_PLAN.map((a) => a.en)).toEqual(['AI Products', 'ML Foundations', 'Data Storytelling', 'GIS & Web', 'Mobile']);
		for (const area of AREA_PLAN) expect(area.es).not.toBe('');
	});
});
