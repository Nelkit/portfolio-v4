import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { remarkBareLinks } from './remark-bare-links';

/**
 * An answer of the chat agent. Model output is untrusted: HTML is not rendered,
 * react-markdown drops unsafe protocols, and images are not loaded.
 */
export function ChatMarkdown({ children }: { children?: string }) {
	return (
		<div className="chat-md">
			<ReactMarkdown
				remarkPlugins={[remarkGfm, remarkBareLinks]}
				disallowedElements={['img']}
				components={{
					a: ({ href, children }) =>
						!href ? <>{children}</> : href.startsWith('mailto:') ? (
							<a href={href}>{children}</a>
						) : (
							<a href={href} target="_blank" rel="noopener noreferrer">{children}</a>
						),
					// Wide tables scroll inside the bubble.
					table: ({ children }) => <div className="chat-md-table"><table>{children}</table></div>,
				}}
			>
				{children ?? ''}
			</ReactMarkdown>
		</div>
	);
}
