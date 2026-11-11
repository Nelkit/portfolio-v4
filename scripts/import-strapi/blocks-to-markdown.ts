/**
 * Converts Strapi "Blocks" rich text (the JSON the old CMS stored) into the
 * Markdown the new admin uses. Migration-only code.
 */
type Node = {
	type: string;
	text?: string;
	children?: Node[];
	level?: number;
	format?: 'ordered' | 'unordered';
	language?: string;
	url?: string;
	image?: { url: string; alternativeText?: string | null };
	bold?: boolean;
	italic?: boolean;
	underline?: boolean;
	strikethrough?: boolean;
	code?: boolean;
};

export type ImageResolver = (url: string, alt: string) => string;

function inline(nodes: Node[] = []): string {
	return nodes
		.map((node) => {
			if (node.type === 'link') return `[${inline(node.children)}](${node.url ?? ''})`;
			let text = node.text ?? inline(node.children);
			if (!text) return '';
			if (node.code) text = `\`${text}\``;
			if (node.bold) text = `**${text}**`;
			if (node.italic) text = `*${text}*`;
			if (node.strikethrough) text = `~~${text}~~`;
			return text; // underline has no Markdown equivalent: kept as plain text
		})
		.join('');
}

function list(node: Node, depth: number): string {
	let n = 0;
	return (node.children ?? [])
		.map((child) => {
			if (child.type === 'list') return list(child, depth + 1);
			n += 1;
			const marker = node.format === 'ordered' ? `${n}.` : '-';
			return `${'  '.repeat(depth)}${marker} ${inline(child.children)}`;
		})
		.join('\n');
}

function block(node: Node, resolveImage: ImageResolver): string {
	switch (node.type) {
		case 'heading':
			return `${'#'.repeat(Math.min(6, Math.max(1, node.level ?? 2)))} ${inline(node.children)}`;
		case 'list':
			return list(node, 0);
		case 'quote':
			return inline(node.children)
				.split('\n')
				.map((line) => `> ${line}`)
				.join('\n');
		case 'code':
			return `\`\`\`${node.language ?? ''}\n${(node.children ?? []).map((c) => c.text ?? '').join('')}\n\`\`\``;
		case 'image': {
			const alt = node.image?.alternativeText?.trim() || 'image';
			return node.image?.url ? `![${alt}](${resolveImage(node.image.url, alt)})` : '';
		}
		default:
			return inline(node.children);
	}
}

/** Blocks → Markdown. Empty blocks are dropped; blocks are separated by a blank line. */
export function blocksToMarkdown(blocks: unknown, resolveImage: ImageResolver = (url) => url): string {
	if (!Array.isArray(blocks)) return typeof blocks === 'string' ? blocks : '';
	return (blocks as Node[])
		.map((b) => block(b, resolveImage).trimEnd())
		.filter((text) => text.trim() !== '')
		.join('\n\n');
}

/** Blocks (or a string) → a single line of text, for short fields like the headline. */
export function blocksToPlainText(blocks: unknown): string {
	if (typeof blocks === 'string') return blocks;
	if (!Array.isArray(blocks)) return '';
	return (blocks as Node[]).map((b) => inline(b.children)).join(' ').trim();
}

/** Image URLs referenced by the blocks (to upload them before converting). */
export function collectImageUrls(blocks: unknown): string[] {
	if (!Array.isArray(blocks)) return [];
	return (blocks as Node[]).flatMap((b) => (b.type === 'image' && b.image?.url ? [b.image.url] : []));
}
