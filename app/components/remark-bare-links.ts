/** The parts of a Markdown (mdast) tree used here. */
type Node = { type: string; value?: string; url?: string; children?: Node[] };

// Only these endings: "Next.js" or "Socket.io" are technologies, not addresses.
const BARE_URL = /(?<![\w@/.-])(?:[a-z0-9-]+\.)+(?:dev|site|com|org|net|au|hn)(?![\w-])(?:\/[\w\-./~%?=&#+]*)?/gi;
const STARTS_WITH_DOMAIN = new RegExp(`^${BARE_URL.source}`, 'i');
const trimEnd = (url: string) => url.replace(/[.?]+$/, '');

function splitText(value: string): Node[] {
	const nodes: Node[] = [];
	let end = 0;
	for (const match of value.matchAll(BARE_URL)) {
		const url = trimEnd(match[0]);
		if (match.index > end) nodes.push({ type: 'text', value: value.slice(end, match.index) });
		nodes.push({ type: 'link', url: `https://${url}`, children: [{ type: 'text', value: url }] });
		end = match.index + url.length;
	}
	if (end < value.length) nodes.push({ type: 'text', value: value.slice(end) });
	return nodes;
}

/**
 * Remark plugin: "cctvai.site" becomes a link, and [demo](cctvai.site) points
 * to https://cctvai.site instead of a path of this site. Models often leave
 * the protocol out. Code is left alone.
 */
export function remarkBareLinks() {
	const visit = (node: Node) => {
		if (node.type === 'link' || node.type === 'definition') {
			if (node.url && STARTS_WITH_DOMAIN.test(node.url)) node.url = `https://${node.url}`;
			return;
		}
		if (!node.children) return;
		node.children = node.children.flatMap((child) => {
			if (child.type === 'text' && child.value) return splitText(child.value);
			visit(child);
			return [child];
		});
	};
	return visit;
}
