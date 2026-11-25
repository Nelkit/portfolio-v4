import { describe, expect, it, vi } from 'vitest';
import { createKnowledgeBase, readPage, type ListChildren, type NotionBlock } from './knowledge-base';

const rt = (text: string, href: string | null = null) => ({ plain_text: text, href });
const block = (type: string, rich: ReturnType<typeof rt>[], extra: Partial<NotionBlock> = {}): NotionBlock =>
	({ id: Math.random().toString(), type, has_children: false, [type]: { rich_text: rich }, ...extra }) as NotionBlock;
const pages = (byParent: Record<string, NotionBlock[][]>): ListChildren => async (id, cursor) => {
	const i = cursor ? Number(cursor) : 0;
	const all = byParent[id] ?? [[]];
	return { results: all[i], next_cursor: i + 1 < all.length ? String(i + 1) : null };
};

describe('readPage', () => {
	it('reads every page of blocks, not only the first 100', async () => {
		const list = pages({ p: [0, 1, 2].map((n) => Array.from({ length: 100 }, (_, i) => block('paragraph', [rt(`b${n * 100 + i}`)]))) });
		const text = await readPage(list, 'p');
		expect(text.split('\n')).toHaveLength(300);
		expect(text).toContain('b299');
	});

	it('keeps headings, lists and the content of nested blocks', async () => {
		const toggle = block('toggle', [rt('More')], { id: 't', has_children: true });
		const text = await readPage(pages({
			p: [[block('heading_2', [rt('Roles')]), block('bulleted_list_item', [rt('AI')]), toggle]],
			t: [[block('paragraph', [rt('inside')])]],
		}), 'p');
		expect(text).toBe('## Roles\n- AI\nMore\n  inside');
	});

	it('reads tables', async () => {
		const row = (...cells: string[]) => ({ id: 'r', type: 'table_row', has_children: false, table_row: { cells: cells.map((c) => [rt(c)]) } }) as unknown as NotionBlock;
		const table = { id: 't', type: 'table', has_children: true, table: {} } as unknown as NotionBlock;
		expect(await readPage(pages({ p: [[table]], t: [[row('Project', 'Demo'), row('Horus', 'cctvai.site')]] }), 'p'))
			.toContain('| Horus | cctvai.site |');
	});

	it('adds the URL of a link whose text does not show it', async () => {
		const text = await readPage(pages({ p: [[block('paragraph', [
			rt('details', 'https://www.x.dev/a'), rt(' '), rt('cctvai.site', 'https://cctvai.site/'), rt(' '),
			rt('a@b.co', 'mailto:a@b.co'), rt(' '), rt('internal', '/abc123'),
		])]] }), 'p');
		expect(text).toBe('details (https://www.x.dev/a) cctvai.site a@b.co internal');
	});
});

describe('createKnowledgeBase', () => {
	const setup = (read: () => Promise<string>) => {
		let now = 0;
		const kb = createKnowledgeBase({ read, ttlMs: 1000, retryMs: 100, now: () => now });
		return { kb, at: (t: number) => { now = t; } };
	};

	it('caches, then refreshes after the TTL', async () => {
		const read = vi.fn().mockResolvedValueOnce('a').mockResolvedValueOnce('b');
		const { kb, at } = setup(read);
		expect([await kb(), await kb()]).toEqual(['a', 'a']);
		at(1001);
		expect(await kb()).toBe('b');
		expect(read).toHaveBeenCalledTimes(2);
	});

	it('serves the last good copy when Notion fails, and waits before retrying', async () => {
		const error = vi.spyOn(console, 'error').mockImplementation(() => {});
		const read = vi.fn().mockResolvedValueOnce('a').mockRejectedValue(new Error('down'));
		const { kb, at } = setup(read);
		await kb();
		at(1001);
		expect(await kb()).toBe('a');
		expect(await kb()).toBe('a');
		expect(read).toHaveBeenCalledTimes(2);
		at(1102);
		await kb();
		expect(read).toHaveBeenCalledTimes(3);
		error.mockRestore();
	});

	it('returns null when there has never been a good copy', async () => {
		const error = vi.spyOn(console, 'error').mockImplementation(() => {});
		expect(await setup(async () => { throw new Error('down'); }).kb()).toBeNull();
		error.mockRestore();
	});

	it('shares one read between simultaneous messages', async () => {
		const read = vi.fn(async () => 'a');
		const { kb } = setup(read);
		await Promise.all([kb(), kb(), kb()]);
		expect(read).toHaveBeenCalledTimes(1);
	});
});
