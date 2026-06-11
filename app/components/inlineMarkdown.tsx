import React from 'react';

// Parses inline markdown (**bold**, *italic*, `code`) inside a plain string
// into React nodes. Handles legacy Strapi content where markdown syntax was
// typed literally instead of using the block editor's native modifiers.
export function parseInlineMarkdown(text: string): React.ReactNode {
	if (!text || (!text.includes('**') && !text.includes('`') && !text.includes('*'))) {
		return text;
	}
	// Order matters: bold (**) before italic (*), and code (`) is independent.
	const pattern = /(\*\*.+?\*\*|`[^`]+`|\*[^*\s][^*]*?\*)/g;
	const parts = text.split(pattern);

	return parts.map((part, i) => {
		if (!part) return null;
		if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
			return <strong key={i}>{part.slice(2, -2)}</strong>;
		}
		if (part.startsWith('`') && part.endsWith('`') && part.length > 2) {
			return <code key={i} className="inline-code">{part.slice(1, -1)}</code>;
		}
		if (part.startsWith('*') && part.endsWith('*') && part.length > 2) {
			return <em key={i}>{part.slice(1, -1)}</em>;
		}
		return <React.Fragment key={i}>{part}</React.Fragment>;
	});
}

// Recursively walks children, applying inline markdown parsing to every string
// leaf — even when nested inside React elements (e.g. links inside a paragraph).
export function renderWithInlineMarkdown(children: React.ReactNode): React.ReactNode {
	return React.Children.map(children, (child) => {
		if (typeof child === 'string') {
			return parseInlineMarkdown(child);
		}
		// Recurse into element children (links, spans from native modifiers, etc.)
		// but skip code/strong — their content must stay literal.
		if (React.isValidElement(child)) {
			if (child.type === 'code' || child.type === 'strong' || child.type === 'pre') {
				return child;
			}
			const el = child as React.ReactElement<{ children?: React.ReactNode }>;
			if (el.props?.children) {
				return React.cloneElement(el, {
					...el.props,
					children: renderWithInlineMarkdown(el.props.children),
				});
			}
		}
		return child;
	});
}
