import { z } from 'zod';
import { LOCALES, type Locale } from '@/app/lib/i18n/locales';

/** Icon shown for a link; `email` links are mailto: and feed the contact CTA. */
export const LINK_TYPES = ['github', 'linkedin', 'email', 'link'] as const;
export type LinkType = (typeof LINK_TYPES)[number];
export const MAX_LINKS = 12;

export type ProfileLink = { type: LinkType; label: string; url: string };

/** Per-language copy. `contactHeadline` may wrap the accent in <em>…</em>. */
export type ProfileTranslation = {
	role: string;
	intro: string;
	cvKey: string | null;
	contactAvailable: string;
	contactHeadline: string;
	contactDescription: string;
};

/** What is stored. File fields are storage keys, not URLs. */
export type ProfileData = {
	name: string;
	avatarKey: string | null;
	translations: Partial<Record<Locale, ProfileTranslation>>;
	links: ProfileLink[];
};

/** What the admin saves: every locale is required (content is bilingual). */
export type ProfileInput = ProfileData & { translations: Record<Locale, ProfileTranslation> };

/** What the public site renders for one locale. */
export type PublicProfile = {
	name: string;
	avatarUrl: string | null;
	role: string;
	intro: string;
	cvUrl: string | null;
	contact: { available: string; headline: string; description: string; email: string | null };
	links: ProfileLink[];
};

// ---------- Admin form parsing ----------

const text = (max: number) => z.string().trim().min(1, 'Required').max(max, `Max ${max} characters`);

const TRANSLATED_FIELDS = {
	role: { field: 'role', schema: text(80) },
	intro: { field: 'intro', schema: text(400) },
	contactAvailable: { field: 'contact_available', schema: text(60) },
	contactHeadline: { field: 'contact_headline', schema: text(160) },
	contactDescription: { field: 'contact_description', schema: text(500) },
} as const;

type TranslatedKey = keyof typeof TRANSLATED_FIELDS;
export type ProfileTextFields = Record<Locale, Omit<ProfileTranslation, 'cvKey'>>;

/** Form field name for a translated value: field('role', 'es') → 'role_es'. */
export const translatedField = (key: TranslatedKey, locale: Locale) =>
	`${TRANSLATED_FIELDS[key].field}_${locale}`;
export const TRANSLATED_KEYS = Object.keys(TRANSLATED_FIELDS) as TranslatedKey[];

const EMAIL = z.email();
const WEB_URL = z.url({ protocol: /^https?$/ });

const linkSchema = z
	.object({
		type: z.enum(LINK_TYPES),
		label: text(40),
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
		if (!WEB_URL.safeParse(link.url).success) {
			ctx.addIssue({ code: 'custom', message: `Must be an http(s) URL: ${link.url}` });
			return z.NEVER;
		}
		return link;
	});

const linksSchema = z.array(linkSchema).max(MAX_LINKS, `Max ${MAX_LINKS} links`);

export type ProfileFormValue = {
	name: string;
	translations: ProfileTextFields;
	links: ProfileLink[];
};

export type ProfileFormResult =
	| { ok: true; value: ProfileFormValue }
	| { ok: false; errors: Record<string, string> };

/** Validates the text part of the profile form (files are validated separately). */
export function parseProfileForm(fields: Record<string, unknown>): ProfileFormResult {
	const errors: Record<string, string> = {};

	const name = text(80).safeParse(fields.name);
	if (!name.success) errors.name = name.error.issues[0].message;

	const translations = {} as ProfileTextFields;
	for (const locale of LOCALES) {
		const values = {} as Omit<ProfileTranslation, 'cvKey'>;
		for (const key of TRANSLATED_KEYS) {
			const fieldName = translatedField(key, locale);
			const result = TRANSLATED_FIELDS[key].schema.safeParse(fields[fieldName]);
			if (result.success) values[key] = result.data;
			else errors[fieldName] = result.error.issues[0].message;
		}
		translations[locale] = values;
	}

	let links: ProfileLink[] = [];
	try {
		const parsed = linksSchema.safeParse(JSON.parse(String(fields.links ?? '[]')));
		if (parsed.success) links = parsed.data;
		else errors.links = parsed.error.issues[0].message;
	} catch {
		errors.links = 'Links are not valid JSON';
	}

	if (Object.keys(errors).length > 0) return { ok: false, errors };
	return { ok: true, value: { name: name.data!, translations, links } };
}

// ---------- Public view ----------

/**
 * Builds what one locale of the public site shows. A missing CV in this
 * language falls back to the other language's CV.
 */
export function toPublicProfile(
	data: ProfileData | null,
	locale: Locale,
	publicUrl: (key: string) => string,
): PublicProfile | null {
	if (!data) return null;
	const t = data.translations[locale] ?? LOCALES.map((l) => data.translations[l]).find(Boolean);
	if (!t) return null;

	const cvKey = t.cvKey ?? LOCALES.map((l) => data.translations[l]?.cvKey).find(Boolean) ?? null;

	return {
		name: data.name,
		avatarUrl: data.avatarKey ? publicUrl(data.avatarKey) : null,
		role: t.role,
		intro: t.intro,
		cvUrl: cvKey ? publicUrl(cvKey) : null,
		contact: {
			available: t.contactAvailable,
			headline: t.contactHeadline,
			description: t.contactDescription,
			email: data.links.find((l) => l.type === 'email')?.url ?? null,
		},
		links: data.links,
	};
}
