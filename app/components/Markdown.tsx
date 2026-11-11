import { isValidElement, type ReactElement, type ReactNode } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

/** Pre-highlighted code HTML (Shiki, server-side), keyed by the raw code text. */
export type HighlightedCode = Record<string, string>;

type CodeProps = { className?: string; children?: ReactNode };

/** Fenced code block: Shiki HTML when available, plain text otherwise. */
function CodeBlock({ code, language, highlighted }: { code: string; language?: string; highlighted?: HighlightedCode }) {
	const html = highlighted?.[code];
	return (
		<div className="code-block" data-language={language || 'text'}>
			{language && <span className="code-lang">{language}</span>}
			{html ? (
				<div className="code-shiki" dangerouslySetInnerHTML={{ __html: html }} />
			) : (
				<pre className="code-fallback"><code>{code}</code></pre>
			)}
		</div>
	);
}

/**
 * Renders admin-authored Markdown. Raw HTML in the source is NOT rendered
 * (react-markdown escapes it), so content can't inject scripts. The only
 * injected HTML is Shiki's output, generated on the server from code text.
 * Works in Server Components (public pages) and Client Components (admin preview).
 */
export function Markdown({ children, highlighted }: { children: string; highlighted?: HighlightedCode }) {
	return (
		<ReactMarkdown
			remarkPlugins={[remarkGfm]}
			components={{
				a: ({ href, children }) => (
					<a href={href} target="_blank" rel="noopener noreferrer">{children}</a>
				),
				pre: ({ children }) => {
					const code = isValidElement(children) ? (children as ReactElement<CodeProps>) : null;
					const text = String(code?.props.children ?? '').replace(/\n$/, '');
					const language = /language-([\w+-]+)/.exec(code?.props.className ?? '')?.[1];
					return <CodeBlock code={text} language={language} highlighted={highlighted} />;
				},
			}}
		>
			{children}
		</ReactMarkdown>
	);
}
