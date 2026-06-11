'use client';

import { BlocksRenderer, type BlocksContent } from '@strapi/blocks-react-renderer';
import { mediaUrl } from '@/app/lib/constant';

type PostBodyProps = {
	content: BlocksContent;
	// Pre-highlighted code HTML (from Shiki, server-side), keyed by block index
	highlighted: Record<number, string>;
};

export function PostBody({ content, highlighted }: PostBodyProps) {
	// The renderer doesn't expose block indices, so we track code blocks in order.
	// Code blocks are top-level only, so a running counter matches the server-side
	// indexing as long as we count every code block the renderer emits.
	const codeIndices = content
		.map((b, i) => (b.type === 'code' ? i : -1))
		.filter((i) => i >= 0);
	let codeCounter = 0;

	return (
		<BlocksRenderer
			content={content}
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
					const blockIndex = codeIndices[codeCounter++];
					const html = highlighted[blockIndex];
					const language = (props as { language?: string }).language;

					// Use Shiki's pre-rendered HTML if available; fall back to plain text
					if (html) {
						return (
							<div className="code-block" data-language={language || 'text'}>
								{language && <span className="code-lang">{language}</span>}
								<div className="code-shiki" dangerouslySetInnerHTML={{ __html: html }} />
							</div>
						);
					}
					const plainText = (props as { plainText?: string }).plainText;
					return (
						<pre className="code-block" data-language={language || 'text'}>
							{language && <span className="code-lang">{language}</span>}
							<code>{plainText ?? ''}</code>
						</pre>
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
