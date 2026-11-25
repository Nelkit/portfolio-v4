type RichText = { plain_text: string; href: string | null };
export type NotionBlock = { id: string; type: string; has_children: boolean };
/** Port: one page (max 100) of the children of a block. */
export type ListChildren = (blockId: string, cursor?: string) => Promise<{ results: NotionBlock[]; next_cursor: string | null }>;

const PREFIX: Record<string, string> = {
	heading_1: '# ',
	heading_2: '## ',
	heading_3: '### ',
	bulleted_list_item: '- ',
	numbered_list_item: '1. ',
	to_do: '- ',
	quote: '> ',
};
const MAX_DEPTH = 4;

const bare = (url: string) => url.replace(/^(https?:\/\/(www\.)?|mailto:)/, '').replace(/\/$/, '');

/** Text of a rich text list; a link whose text does not show its URL gets it in parentheses. */
function richText(list: RichText[]): string {
	return list
		.map(({ plain_text, href }) => {
			// hrefs starting with "/" are Notion-internal: useless to a visitor.
			const hidden = href && !href.startsWith('/') && !plain_text.includes(bare(href));
			return hidden ? `${plain_text} (${href})` : plain_text;
		})
		.join('');
}

function blockText(block: NotionBlock): string {
	const content = (block as unknown as Record<string, { rich_text?: RichText[]; cells?: RichText[][]; url?: string } | undefined>)[block.type];
	if (content?.cells) return `| ${content.cells.map(richText).join(' | ')} |`;
	if (content?.rich_text) {
		const text = richText(content.rich_text);
		return text ? (PREFIX[block.type] ?? '') + text : '';
	}
	return content?.url ?? ''; // bookmark, embed
}

/** The whole page as text: every page of results, nested blocks and tables. */
export async function readPage(list: ListChildren, pageId: string): Promise<string> {
	const lines: string[] = [];
	const visit = async (parentId: string, depth: number) => {
		let cursor: string | undefined;
		do {
			const { results, next_cursor } = await list(parentId, cursor);
			for (const block of results) {
				const text = blockText(block);
				// A container without text (table, columns) does not indent its content.
				if (text) lines.push('  '.repeat(depth) + text);
				const isOtherPage = block.type === 'child_page' || block.type === 'child_database';
				if (block.has_children && !isOtherPage && depth < MAX_DEPTH) await visit(block.id, text ? depth + 1 : depth);
			}
			cursor = next_cursor ?? undefined;
		} while (cursor);
	};
	await visit(pageId, 0);
	return lines.join('\n');
}

/**
 * Cached reader. If a refresh fails it keeps serving the last good copy and
 * waits `retryMs` before trying again; null only if it never worked.
 */
export function createKnowledgeBase({
	read,
	ttlMs,
	retryMs,
	now = Date.now,
}: {
	read: () => Promise<string>;
	ttlMs: number;
	retryMs: number;
	now?: () => number;
}): () => Promise<string | null> {
	let content: string | null = null;
	let refreshAt = -Infinity;
	let pending: Promise<string | null> | null = null;

	const refresh = async () => {
		try {
			content = await read();
			refreshAt = now() + ttlMs;
		} catch (error) {
			console.error('Notion read failed:', error);
			refreshAt = now() + retryMs;
		}
		return content;
	};

	return async () => {
		if (now() < refreshAt) return content;
		pending ??= refresh().finally(() => { pending = null; });
		return pending;
	};
}
