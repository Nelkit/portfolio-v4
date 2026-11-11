import { highlightCode } from '@/app/lib/highlight';
import type { HighlightedCode } from '@/app/components/Markdown';
import { extractCodeBlocks } from './post';

/** Highlights every fenced code block of a Markdown body with Shiki (server only). */
export async function highlightMarkdownCode(markdown: string): Promise<HighlightedCode> {
	const blocks = extractCodeBlocks(markdown);
	const entries = await Promise.all(blocks.map(async (b) => [b.code, await highlightCode(b.code, b.lang)] as const));
	return Object.fromEntries(entries);
}
