import React from 'react';

// Parses inline markdown (**bold**, *italic*, `code`) inside a plain string
// into React nodes. This handles legacy Strapi content where markdown syntax
// was typed literally instead of using the block editor's native modifiers.
export function parseInlineMarkdown(text: string): React.ReactNode {
	if (!text) return text;
	// Split on **bold**, *italic*, or `code`, keeping the delimiters
	const pattern = /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g;
	const parts = text.split(pattern);

	return parts.map((part, i) => {
		if (!part) return null;
		if (part.startsWith('**') && part.endsWith('**')) {
			return <strong key={i}>{part.slice(2, -2)}</strong>;
		}
		if (part.startsWith('`') && part.endsWith('`')) {
			return <code key={i} className="inline-code">{part.slice(1, -1)}</code>;
		}
		if (part.startsWith('*') && part.endsWith('*')) {
			return <em key={i}>{part.slice(1, -1)}</em>;
		}
		return <React.Fragment key={i}>{part}</React.Fragment>;
	});
}

// Recursively walks children, applying inline markdown parsing to string leaves.
export function renderWithInlineMarkdown(children: React.ReactNode): React.ReactNode {
	return React.Children.map(children, (child) => {
		if (typeof child === 'string') {
			return parseInlineMarkdown(child);
		}
		return child;
	});
}
