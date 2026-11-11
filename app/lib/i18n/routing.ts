import { DEFAULT_LOCALE, LOCALES, type Locale } from './locales';

/** Cookie that stores the visitor's explicit language choice (set by the switcher). */
export const LOCALE_COOKIE = 'NEXT_LOCALE';

export function isLocale(value: unknown): value is Locale {
	return typeof value === 'string' && (LOCALES as readonly string[]).includes(value);
}

/**
 * Picks the locale for a request with no locale in the URL.
 * Priority: explicit choice (cookie) > browser preference (Accept-Language) > default.
 */
export function negotiateLocale({
	cookie,
	acceptLanguage,
}: {
	cookie?: string;
	acceptLanguage?: string | null;
}): Locale {
	if (isLocale(cookie)) return cookie;

	const preferences = (acceptLanguage ?? '')
		.split(',')
		.map((part, index) => {
			const [tag, ...params] = part.trim().split(';');
			const q = params.find((p) => p.trim().startsWith('q='));
			const quality = q ? Number(q.trim().slice(2)) : 1;
			return { language: tag.split('-')[0].toLowerCase(), quality: isNaN(quality) ? 0 : quality, index };
		})
		.filter((p) => p.language && p.quality > 0)
		.sort((a, b) => b.quality - a.quality || a.index - b.index);

	return preferences.find((p) => isLocale(p.language))?.language as Locale | undefined ?? DEFAULT_LOCALE;
}

export function getLocaleFromPathname(pathname: string): Locale | null {
	const first = pathname.split('/')[1];
	return isLocale(first) ? first : null;
}

/** '/blog?page=2' → '/es/blog?page=2'; '/' → '/es'; '/#work' → '/es#work'. */
export function localizePath(locale: Locale, path: string): string {
	const match = path.match(/^([^?#]*)(.*)$/);
	const pathname = match?.[1] ?? '';
	const suffix = match?.[2] ?? '';
	const rest = pathname === '/' || pathname === '' ? '' : pathname;
	return `/${locale}${rest}${suffix}`;
}

/** Same page in another language: '/en/blog/x' → '/es/blog/x'. */
export function switchLocalePath(pathname: string, target: Locale): string {
	const current = getLocaleFromPathname(pathname);
	const withoutLocale = current ? pathname.slice(current.length + 1) || '/' : pathname;
	return localizePath(target, withoutLocale);
}
