import { describe, expect, it } from 'vitest';
import { blocksToMarkdown, blocksToPlainText, collectImageUrls } from './blocks-to-markdown';

const p = (...children: object[]) => ({ type: 'paragraph', children });
const t = (text: string, marks: Record<string, boolean> = {}) => ({ type: 'text', text, ...marks });

describe('blocksToMarkdown', () => {
	it('converts paragraphs, headings and inline marks', () => {
		const md = blocksToMarkdown([
			{ type: 'heading', level: 2, children: [t('The Core Idea')] },
			p(t('Plain, '), t('bold', { bold: true }), t(', '), t('italic', { italic: true }), t(', '), t('code', { code: true }), t(', '), t('gone', { strikethrough: true })),
		]);
		expect(md).toBe('## The Core Idea\n\nPlain, **bold**, *italic*, `code`, ~~gone~~');
	});

	it('keeps Markdown the author typed literally inside text, and drops empty paragraphs', () => {
		expect(blocksToMarkdown([p(t('V4 asks: **what if?**')), p(t('')), p(t('Next.'))])).toBe('V4 asks: **what if?**\n\nNext.');
	});

	it('converts links, quotes and code blocks', () => {
		const md = blocksToMarkdown([
			p(t('See '), { type: 'link', url: 'https://nelkit.dev', children: [t('my site')] }),
			{ type: 'quote', children: [t('Ship it.')] },
			{ type: 'code', language: 'ts', children: [t('const a = 1;\nconst b = 2;')] },
		]);
		expect(md).toBe('See [my site](https://nelkit.dev)\n\n> Ship it.\n\n```ts\nconst a = 1;\nconst b = 2;\n```');
	});

	it('converts ordered, unordered and nested lists', () => {
		const md = blocksToMarkdown([
			{ type: 'list', format: 'unordered', children: [
				{ type: 'list-item', children: [t('one')] },
				{ type: 'list', format: 'ordered', children: [{ type: 'list-item', children: [t('nested')] }] },
				{ type: 'list-item', children: [t('two')] },
			] },
		]);
		expect(md).toBe('- one\n  1. nested\n- two');
	});

	it('maps images through the resolver (to upload: references)', () => {
		const md = blocksToMarkdown(
			[{ type: 'image', image: { url: '/uploads/a.png', alternativeText: 'Diagram' }, children: [t('')] }],
			(url) => `upload:posts/1/${url.split('/').pop()}`,
		);
		expect(md).toBe('![Diagram](upload:posts/1/a.png)');
	});

	it('returns an empty string for null/empty content', () => {
		expect(blocksToMarkdown(null)).toBe('');
		expect(blocksToMarkdown([])).toBe('');
	});
});

describe('blocksToPlainText', () => {
	it('joins the text of every block (for one-line fields like the headline)', () => {
		expect(blocksToPlainText([p(t('Building <em className="ac">AI</em> that ships'))])).toBe('Building <em className="ac">AI</em> that ships');
		expect(blocksToPlainText('already a string')).toBe('already a string');
	});
});

describe('collectImageUrls', () => {
	it('finds every image URL in the blocks', () => {
		expect(collectImageUrls([p(t('x')), { type: 'image', image: { url: '/uploads/a.png' }, children: [] }])).toEqual(['/uploads/a.png']);
	});
});
