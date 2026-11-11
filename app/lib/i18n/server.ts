import { notFound } from 'next/navigation';
import { getDictionary } from './dictionaries';
import type { Locale } from './locales';
import { isLocale, localizePath } from './routing';

/**
 * For Server Components: validates the [locale] param (404 if unsupported)
 * and returns the locale, its dictionary and a locale-aware href helper.
 */
export async function resolveLocale(params: Promise<{ locale: string }>) {
	const { locale } = await params;
	if (!isLocale(locale)) notFound();
	return {
		locale: locale as Locale,
		t: getDictionary(locale),
		href: (path: string) => localizePath(locale, path),
	};
}
