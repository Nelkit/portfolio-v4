/**
 * Step 1 of the Strapi import (READ-ONLY on Strapi):
 *   pnpm tsx scripts/import-strapi/extract.ts [http://localhost:1337]
 * Writes data/strapi.json (raw content) and data/content-en.json (the
 * translatable texts) — translate the latter into data/content-es.json.
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { slugify } from '@/app/lib/content/projects/project';
import { blocksToMarkdown, blocksToPlainText } from './blocks-to-markdown';

const STRAPI = process.argv[2] ?? 'http://localhost:1337';
const DATA = join(import.meta.dirname, 'data');

const query = (params: Record<string, string>) => new URLSearchParams({ 'pagination[pageSize]': '100', ...params }).toString();
const ENDPOINTS: Record<string, string> = {
	homePage: `/api/home-page?${new URLSearchParams({ 'populate[avatarImage]': 'true', 'populate[resume]': 'true', 'populate[socialNetworkLinks]': 'true', 'populate[ctaSection][populate]': '*' })}`,
	projects: `/api/projects?${query({ 'populate[image]': 'true', 'populate[screenshots]': 'true', 'populate[skills]': 'true', 'populate[expertiseArea]': 'true', 'populate[links]': 'true', 'sort[0]': 'createdAt:desc' })}`,
	blogEntries: `/api/blog-entries?${query({ 'populate[featuredImage]': 'true', 'populate[blog_tags]': 'true' })}`,
	expertiseAreas: `/api/expertise-areas?${query({ 'sort[0]': 'id:asc' })}`,
	skillCategories: `/api/skill-categories?${query({ 'populate[skills]': 'true', 'sort[0]': 'id:asc' })}`,
	careerEntries: `/api/career-entries?${query({ 'sort[0]': 'id:asc' })}`,
	educationEntries: `/api/education-entries?${query({ 'sort[0]': 'id:asc' })}`,
	blogTags: `/api/blog-tags?${query({ 'sort[0]': 'id:asc' })}`,
};

async function main() {
	const raw: Record<string, unknown> = {};
	for (const [name, path] of Object.entries(ENDPOINTS)) {
		const res = await fetch(`${STRAPI}${path}`);
		if (!res.ok) throw new Error(`${path} → ${res.status}`);
		raw[name] = ((await res.json()) as { data: unknown }).data;
	}
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const r = raw as any;
	const cta = r.homePage.ctaSection ?? {};

	const content = {
		hero: { headline: blocksToPlainText(r.homePage.headline).replace(/<em[^>]*>/g, '<em>') },
		profile: {
			role: r.homePage.subtitle ?? '',
			intro: r.homePage.description ?? '',
			contactAvailable: cta.available ?? '',
			contactHeadline: blocksToPlainText(cta.header).replace(/<em[^>]*>/g, '<em>'),
			contactDescription: cta.description ?? '',
		},
		areas: Object.fromEntries(r.expertiseAreas.map((a: { code: string; title: string }) => [a.code, a.title])),
		skillCategories: Object.fromEntries(r.skillCategories.map((c: { label: string }) => [c.label, c.label])),
		projects: Object.fromEntries(
			r.projects.map((p: { title: string; summary?: string; description?: unknown }) => [
				slugify(p.title),
				{ title: p.title, summary: p.summary ?? '', description: blocksToMarkdown(p.description) },
			]),
		),
		career: Object.fromEntries(r.careerEntries.map((c: { id: number; title: string; detail?: string }) => [String(c.id), { title: c.title, detail: c.detail ?? '' }])),
		education: Object.fromEntries(
			r.educationEntries.map((e: { id: number; degree: string; institution: string; description?: string }) => [
				String(e.id),
				{ degree: e.degree, institution: e.institution, description: e.description ?? '' },
			]),
		),
		tags: Object.fromEntries(r.blogTags.map((t: { title: string }) => [t.title, t.title])),
	};

	mkdirSync(DATA, { recursive: true });
	writeFileSync(join(DATA, 'strapi.json'), JSON.stringify(raw, null, 2));
	writeFileSync(join(DATA, 'content-en.json'), JSON.stringify(content, null, 2));
	console.log('Wrote data/strapi.json and data/content-en.json');
	for (const [name, value] of Object.entries(raw)) console.log(`  ${name.padEnd(17)} ${Array.isArray(value) ? value.length : 'single'}`);
}

main().catch((error) => {
	console.error(error);
	process.exit(1);
});
