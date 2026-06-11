'use client';

import { BlocksRenderer, type BlocksContent } from '@strapi/blocks-react-renderer';
import { mediaUrl } from '@/app/lib/constant';
import { transformInlineMarkdown } from '@/app/components/inlineMarkdown';

type PostBodyProps = {
	content: BlocksContent;
	// Pre-highlighted code HTML (from Shiki, server-side), keyed by the raw code text.
	// Keying by content (not index) keeps server and client render identical → no hydration mismatch.
	highlighted: Record<string, string>;
};

export function PostBody({ content, highlighted }: PostBodyProps) {
	// Expand literal markdown (**bold**, `code`) into native modifier nodes so
	// the renderer styles them. Done once on the raw block tree.
	const normalized = transformInlineMarkdown(content);

	return (
		<BlocksRenderer
			content={normalized}
			blocks={{
				paragraph: ({ children }) => <p>{children}</p>,
				heading: ({ children, level }) => {
					const Tag = `h${level}` as keyof React.JSX.IntrinsicElements;
					return <Tag>{children}</Tag>;
				},
				list: ({ children, format }) =>
					format === 'ordered' ? <ol>{children}</ol> : <ul>{children}</ul>,
				'list-item': ({ children }) => <li>{children}</li>,
				quote: ({ children }) => <blockquote>{children}</blockquote>,
				link: ({ children, url }) => (
					<a href={url} target="_blank" rel="noopener noreferrer">{children}</a>
				),
				image: ({ image }) => (
					<img src={mediaUrl(image.url)} alt={image.alternativeText || ''} className="post-body-img" />
				),
				code: (props) => {
					const plainText = (props as { plainText?: string }).plainText ?? '';
					const language = (props as { language?: string }).language;
					const html = highlighted[plainText];

					// Use Shiki's pre-rendered HTML if available; fall back to plain text
					if (html) {
						return (
							<div className="code-block" data-language={language || 'text'}>
								{language && <span className="code-lang">{language}</span>}
								<div className="code-shiki" dangerouslySetInnerHTML={{ __html: html }} />
							</div>
						);
					}
					return (
						<div className="code-block" data-language={language || 'text'}>
							{language && <span className="code-lang">{language}</span>}
							<pre className="code-fallback"><code>{plainText}</code></pre>
						</div>
					);
				},
			}}
			modifiers={{
				bold: ({ children }) => <strong>{children}</strong>,
				italic: ({ children }) => <em>{children}</em>,
				underline: ({ children }) => <u>{children}</u>,
				strikethrough: ({ children }) => <s>{children}</s>,
				code: ({ children }) => <code className="inline-code">{children}</code>,
			}}
		/>
	);
}
