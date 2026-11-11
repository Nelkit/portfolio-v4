import { z } from 'zod';

/** Icon shown for a link; `email` links are mailto: (and feed the contact CTA). */
export const LINK_TYPES = ['github', 'linkedin', 'email', 'link'] as const;
export type LinkType = (typeof LINK_TYPES)[number];
export const MAX_LINKS = 12;

export type Link = { type: LinkType; label: string; url: string };

const EMAIL = z.email();
const WEB_URL = z.url({ protocol: /^https?$/ });

const linkSchema = z
	.object({
		type: z.enum(LINK_TYPES),
		label: z.string().trim().min(1, 'Required').max(40, 'Max 40 characters'),
		url: z.string().trim().min(1),
	})
	.transform((link, ctx) => {
		if (link.type === 'email') {
			const address = link.url.replace(/^mailto:/i, '');
			if (!EMAIL.safeParse(address).success) {
				ctx.addIssue({ code: 'custom', message: `Invalid email: ${link.url}` });
				return z.NEVER;
			}
			return { ...link, url: `mailto:${address}` };
		}
		// Only http(s): blocks javascript:, data:, etc. in public hrefs.
		if (!WEB_URL.safeParse(link.url).success) {
			ctx.addIssue({ code: 'custom', message: `Must be an http(s) URL: ${link.url}` });
			return z.NEVER;
		}
		return link;
	});

const linksSchema = z.array(linkSchema).max(MAX_LINKS, `Max ${MAX_LINKS} links`);

/** Parses the JSON list sent by the admin links editor. */
export function parseLinks(raw: unknown): { ok: true; links: Link[] } | { ok: false; error: string } {
	try {
		const parsed = linksSchema.safeParse(JSON.parse(String(raw ?? '[]')));
		return parsed.success ? { ok: true, links: parsed.data } : { ok: false, error: parsed.error.issues[0].message };
	} catch {
		return { ok: false, error: 'Links are not valid JSON' };
	}
}
