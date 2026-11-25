import { describe, expect, it } from 'vitest';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { ChatMarkdown } from './ChatMarkdown';

const html = (text: string) => renderToStaticMarkup(createElement(ChatMarkdown, null, text));
const hrefs = (text: string) => [...html(text).matchAll(/href="([^"]*)"/g)].map((m) => m[1]);

describe('ChatMarkdown links', () => {
	it.each([
		['Markdown link', '[CV](https://media.nelkit.dev/a.pdf)', ['https://media.nelkit.dev/a.pdf']],
		['Markdown link without protocol', '[demo](cctvai.site)', ['https://cctvai.site']],
		['full URL', 'See https://cctvai.site.', ['https://cctvai.site']],
		['bare domain', 'Live demo: cctvai.site', ['https://cctvai.site']],
		['bare domain with path and final dot', 'It is media.nelkit.dev/profile/cv-en-o6zc6nbw.pdf.', ['https://media.nelkit.dev/profile/cv-en-o6zc6nbw.pdf']],
		['in parentheses', 'Code (github.com/Nelkit/NKAlert)', ['https://github.com/Nelkit/NKAlert']],
		['several', 'cctvai.site and github.com/Nelkit', ['https://cctvai.site', 'https://github.com/Nelkit']],
		['bold', '**cctvai.site**', ['https://cctvai.site']],
		['email', 'me@mail.com', ['mailto:me@mail.com']],
		['country domain', 'geoportal.sag.gob.hn/geoportal_public', ['https://geoportal.sag.gob.hn/geoportal_public']],
	])('%s', (_name, text, expected) => {
		expect(hrefs(text)).toEqual(expected);
	});

	it('does not turn technology names, versions or code into links', () => {
		expect(hrefs('Next.js, Node.js, YOLO26, 0.886 and `cctvai.site`')).toEqual([]);
	});

	it('opens web links in a new tab and email in the same one', () => {
		expect(html('cctvai.site')).toContain('target="_blank" rel="noopener noreferrer"');
		expect(html('me@mail.com')).not.toContain('target');
	});

	it('drops unsafe links, HTML and images', () => {
		expect(html('[x](javascript:alert(1))')).not.toContain('javascript');
		expect(html('<script>alert(1)</script>')).not.toContain('<script');
		expect(html('![x](https://evil.test/track.png)')).not.toContain('<img');
	});
});

describe('ChatMarkdown formatting', () => {
	it('renders lists, bold text and tables', () => {
		expect(html('- **Horus**: search')).toContain('<li><strong>Horus</strong>: search</li>');
		expect(html('| a | b |\n|---|---|\n| 1 | 2 |')).toContain('<td>1</td>');
	});
});
