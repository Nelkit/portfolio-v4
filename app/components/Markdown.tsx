import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

/**
 * Renders admin-authored Markdown. Raw HTML in the source is NOT rendered
 * (react-markdown escapes it), so content can't inject scripts.
 * Works in Server Components (public pages) and Client Components (admin preview).
 */
export function Markdown({ children }: { children: string }) {
	return (
		<ReactMarkdown
			remarkPlugins={[remarkGfm]}
			components={{
				a: ({ href, children }) => (
					<a href={href} target="_blank" rel="noopener noreferrer">{children}</a>
				),
			}}
		>
			{children}
		</ReactMarkdown>
	);
}
