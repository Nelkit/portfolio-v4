import { describe, expect, it } from 'vitest';
import {
	extractCodeBlocks,
	imageMarkdown,
	parsePostForm,
	readingTime,
	referencedUploadKeys,
	relatedPosts,
	resolveUploadUrl,
	sortPosts,
	toPostView,
	type PostRecord,
} from './post';

const base = { slug: '', publishedOn: '2026-11-01' };
const en = { title_en: ' Shipping ML ', summary_en: 'How I ship', body_en: '# Hello\n\nSome text.' };
const es = { title_es: 'Lanzando ML', summary_es: 'Cómo lanzo', body_es: '# Hola\n\nAlgo de texto.' };

describe('parsePostForm', () => {
	it('accepts a post written only in Spanish (other language left empty)', () => {
		const result = parsePostForm({ ...base, ...es, title_en: '', summary_en: '', body_en: '' });
		expect(result.ok).toBe(true);
		if (!result.ok) return;
		expect(Object.keys(result.value.translations)).toEqual(['es']);
		expect(result.value.slug).toBe('lanzando-ml');
	});

	it('accepts both languages, trims, and derives the slug from the English title', () => {
		const result = parsePostForm({ ...base, ...en, ...es });
		expect(result.ok).toBe(true);
		if (!result.ok) return;
		expect(result.value.slug).toBe('shipping-ml');
		expect(result.value.translations.en?.title).toBe('Shipping ML');
		expect(result.value.publishedOn).toBe('2026-11-01');
	});

	it('requires at least one language', () => {
		const result = parsePostForm({ ...base });
		expect(result.ok).toBe(false);
		if (!result.ok) expect(result.errors.translations).toBeDefined();
	});

	it('a started language needs a title and a body (summary is optional)', () => {
		const result = parsePostForm({ ...base, ...es, title_en: 'Only a title', body_en: '' });
		expect(result.ok).toBe(false);
		if (!result.ok) expect(Object.keys(result.errors)).toEqual(['body_en']);
		expect(parsePostForm({ ...base, ...es, summary_es: '' }).ok).toBe(true);
	});

	it('parses the selected tags (deduplicated, positive ids only)', () => {
		const result = parsePostForm({ ...base, ...en, tagIds: ['3', '1', '3'] });
		expect(result.ok && result.value.tagIds).toEqual([3, 1]);
		expect(parsePostForm({ ...base, ...en }).ok && true).toBe(true);
		expect(parsePostForm({ ...base, ...en, tagIds: ['abc'] }).ok).toBe(false);
	});

	it('validates the slug and the publication date', () => {
		expect(parsePostForm({ ...base, ...en, slug: 'Bad Slug' }).ok).toBe(false);
		expect(parsePostForm({ ...base, ...en, publishedOn: '2026-13-01' }).ok).toBe(false);
		expect(parsePostForm({ ...base, ...en, publishedOn: '' }).ok).toBe(false);
	});
});

describe('readingTime', () => {
	it('is words / 200, rounded up, at least 1 minute', () => {
		expect(readingTime('')).toBe(1);
		expect(readingTime(Array(450).fill('word').join(' '))).toBe(3);
	});
});

describe('extractCodeBlocks', () => {
	it('finds fenced code blocks with their language', () => {
		const body = 'Intro\n\n```ts\nconst a = 1;\n```\n\ntext `inline`\n\n```\nplain\n```\n';
		expect(extractCodeBlocks(body)).toEqual([
			{ lang: 'ts', code: 'const a = 1;' },
			{ lang: undefined, code: 'plain' },
		]);
	});
});

const url = (key: string) => `https://cdn.test/${key}`;

const record = (id: number, publishedOn: string, langs: ('en' | 'es')[], coverKey: string | null = null): PostRecord => ({
	id,
	slug: `post-${id}`,
	publishedOn,
	coverKey,
	tagIds: [],
	translations: Object.fromEntries(langs.map((l) => [l, { title: `t${id}-${l}`, summary: 's', body: 'b' }])),
});

describe('toPostView', () => {
	it('has no view in a language the post was not written in (no fallback for posts)', () => {
		expect(toPostView(record(1, '2026-01-01', ['es']), 'en', url)).toBeNull();
		expect(toPostView(record(1, '2026-01-01', ['es']), 'es', url)).toMatchObject({ slug: 'post-1', title: 't1-es', readingTime: 1 });
	});

	it('lists the languages the post is available in', () => {
		expect(toPostView(record(1, '2026-01-01', ['en', 'es']), 'en', url)?.locales).toEqual(['en', 'es']);
	});

	it('exposes its tags in the requested language (unknown ids are ignored)', () => {
		const tags = [{ id: 1, slug: 'ml', name: 'AA' }];
		const view = toPostView({ ...record(1, '2026-01-01', ['es']), tagIds: [1, 99] }, 'es', url, tags);
		expect(view?.tags).toEqual([{ id: 1, slug: 'ml', name: 'AA' }]);
	});

	it('resolves the cover to a public URL (or none)', () => {
		expect(toPostView(record(1, '2026-01-01', ['en'], 'posts/1/cover-a.webp'), 'en', url)?.coverUrl).toBe('https://cdn.test/posts/1/cover-a.webp');
		expect(toPostView(record(1, '2026-01-01', ['en']), 'en', url)?.coverUrl).toBeNull();
	});
});

describe('uploaded images in Markdown', () => {
	it('builds a storage-independent image reference, using the file name as alt text', () => {
		expect(imageMarkdown('posts/3/img-ab12cd34.png', 'My Diagram (final).png')).toBe('![My Diagram (final)](upload:posts/3/img-ab12cd34.png)');
	});

	it('resolves upload: references against the current storage base, leaves other URLs alone', () => {
		expect(resolveUploadUrl('upload:posts/3/img-a.png', 'https://media.nelkit.dev')).toBe('https://media.nelkit.dev/posts/3/img-a.png');
		expect(resolveUploadUrl('upload:posts/3/img-a.png', '/uploads/')).toBe('/uploads/posts/3/img-a.png');
		expect(resolveUploadUrl('https://example.com/x.png', '/uploads')).toBe('https://example.com/x.png');
		expect(resolveUploadUrl('javascript:alert(1)', '/uploads')).toBe('');
	});

	it('finds the uploaded keys a body references', () => {
		const body = 'a ![x](upload:posts/3/img-a.png) b ![y](upload:posts/3/img-b.webp) c ![z](https://e.com/z.png)';
		expect(referencedUploadKeys(body)).toEqual(['posts/3/img-a.png', 'posts/3/img-b.webp']);
	});
});

describe('relatedPosts', () => {
	const t = (id: number) => ({ id, slug: `t${id}`, name: `T${id}` });
	const view = (slug: string, publishedOn: string, tagIds: number[]) => ({
		slug, publishedOn, title: slug, summary: '', readingTime: 1, locales: ['en' as const], coverUrl: null, tags: tagIds.map(t),
	});

	it('ranks posts sharing more tags first, then newest; excludes the post itself and posts without shared tags', () => {
		const current = view('current', '2026-05-01', [1, 2]);
		const all = [
			current,
			view('one-shared-new', '2026-04-01', [1]),
			view('two-shared', '2025-01-01', [1, 2]),
			view('one-shared-old', '2024-01-01', [2]),
			view('unrelated', '2026-04-15', [3]),
		];
		expect(relatedPosts(current, all, 3).map((p) => p.slug)).toEqual(['two-shared', 'one-shared-new', 'one-shared-old']);
		expect(relatedPosts(current, all, 1).map((p) => p.slug)).toEqual(['two-shared']);
		expect(relatedPosts(view('lonely', '2026-01-01', []), all, 3)).toEqual([]);
	});
});

describe('sortPosts', () => {
	it('orders by publication date, newest first (ties: newest id first)', () => {
		const sorted = sortPosts([record(1, '2026-01-01', ['en']), record(2, '2026-03-01', ['en']), record(3, '2026-01-01', ['en'])]);
		expect(sorted.map((p) => p.id)).toEqual([2, 3, 1]);
	});
});
