import { describe, expect, it } from 'vitest';
import { extractCodeBlocks, parsePostForm, readingTime, sortPosts, toPostView, type PostRecord } from './post';

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

const record = (id: number, publishedOn: string, langs: ('en' | 'es')[]): PostRecord => ({
	id,
	slug: `post-${id}`,
	publishedOn,
	translations: Object.fromEntries(langs.map((l) => [l, { title: `t${id}-${l}`, summary: 's', body: 'b' }])),
});

describe('toPostView', () => {
	it('has no view in a language the post was not written in (no fallback for posts)', () => {
		expect(toPostView(record(1, '2026-01-01', ['es']), 'en')).toBeNull();
		expect(toPostView(record(1, '2026-01-01', ['es']), 'es')).toMatchObject({ slug: 'post-1', title: 't1-es', readingTime: 1 });
	});

	it('lists the languages the post is available in', () => {
		expect(toPostView(record(1, '2026-01-01', ['en', 'es']), 'en')?.locales).toEqual(['en', 'es']);
	});
});

describe('sortPosts', () => {
	it('orders by publication date, newest first (ties: newest id first)', () => {
		const sorted = sortPosts([record(1, '2026-01-01', ['en']), record(2, '2026-03-01', ['en']), record(3, '2026-01-01', ['en'])]);
		expect(sorted.map((p) => p.id)).toEqual([2, 3, 1]);
	});
});
