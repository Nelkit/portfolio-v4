import type { BlocksContent } from '@strapi/blocks-react-renderer';

// A single inline text node as Strapi stores it
type TextNode = {
	type: 'text';
	text: string;
	bold?: boolean;
	italic?: boolean;
	underline?: boolean;
	strikethrough?: boolean;
	code?: boolean;
};

// Splits a plain-text node containing literal markdown (**bold**, `code`,
// *italic*) into multiple text nodes with the corresponding native modifiers.
// This lets the official renderer style them, instead of showing raw ** / `.
function splitTextNode(node: TextNode): TextNode[] {
	const text = node.text;
	if (!text || (!text.includes('**') && !text.includes('`') && !text.includes('*'))) {
		return [node];
	}

	const pattern = /(\*\*.+?\*\*|`[^`]+`|\*[^*\s][^*]*?\*)/g;
	const parts = text.split(pattern).filter((p) => p !== '');

	return parts.map((part) => {
		if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
			return { ...node, text: part.slice(2, -2), bold: true };
		}
		if (part.startsWith('`') && part.endsWith('`') && part.length > 2) {
			return { ...node, text: part.slice(1, -1), code: true };
		}
		if (part.startsWith('*') && part.endsWith('*') && part.length > 2) {
			return { ...node, text: part.slice(1, -1), italic: true };
		}
		return { ...node, text: part };
	});
}

// Recursively transforms a blocks tree, expanding literal-markdown text nodes
// into modifier-bearing nodes. Code blocks are left untouched (Shiki owns them).
function transformNode(node: unknown): unknown {
	if (!node || typeof node !== 'object') return node;
	const n = node as { type?: string; children?: unknown[]; text?: string };

	// Never rewrite inside code blocks — their text must stay literal.
	if (n.type === 'code') return node;

	// A text leaf — split it if it carries literal markdown
	if (n.type === 'text' && typeof n.text === 'string') {
		return splitTextNode(n as TextNode);
	}

	// A container with children — recurse and flatten (splitTextNode returns arrays)
	if (Array.isArray(n.children)) {
		const newChildren = n.children.flatMap((child) => {
			const result = transformNode(child);
			return Array.isArray(result) ? result : [result];
		});
		return { ...n, children: newChildren };
	}

	return node;
}

export function transformInlineMarkdown(content: BlocksContent): BlocksContent {
	return content.map((block) => transformNode(block) as BlocksContent[number]);
}
