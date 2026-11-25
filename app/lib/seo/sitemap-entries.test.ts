import { describe, expect, it } from 'vitest';
import { sitemapEntries } from './sitemap-entries';

const entries = sitemapEntries({
	siteUrl: 'https://x.dev',
	projectSlugs: ['horus'],
	posts: [{ slug: 'hello', locales: ['en'], publishedOn: '2026-01-02' }],
});
const find = (path: string) => entries.find((e) => e.url === `https://x.dev${path}`);

describe('sitemapEntries', () => {
	it('lists every page in every language it exists in', () => {
		expect(entries.map((e) => e.url)).toEqual([
			'https://x.dev/en', 'https://x.dev/es',
			'https://x.dev/en/projects', 'https://x.dev/es/projects',
			'https://x.dev/en/blog',
			'https://x.dev/en/projects/horus', 'https://x.dev/es/projects/horus',
			'https://x.dev/en/blog/hello',
		]);
	});

	it('links the translations of a page to each other', () => {
		const languages = { en: 'https://x.dev/en/projects/horus', es: 'https://x.dev/es/projects/horus' };
		expect(find('/en/projects/horus')?.alternates).toEqual({ languages });
		expect(find('/es/projects/horus')?.alternates).toEqual({ languages });
	});

	it('does not point to a translation that does not exist', () => {
		expect(find('/en/blog/hello')?.alternates).toEqual({ languages: { en: 'https://x.dev/en/blog/hello' } });
		expect(find('/es/blog/hello')).toBeUndefined();
	});

	it('dates posts', () => {
		expect(find('/en/blog/hello')?.lastModified).toBe('2026-01-02');
	});
});
