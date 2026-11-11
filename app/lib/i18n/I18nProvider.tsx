'use client';

import { createContext, useContext } from 'react';
import type { Locale } from './locales';
import { getDictionary, type Dictionary } from './dictionaries';
import { localizePath } from './routing';

type I18nContextValue = {
	locale: Locale;
	t: Dictionary;
	/** Prefixes an internal path with the current locale: href('/blog') → '/es/blog'. */
	href: (path: string) => string;
};

const I18nContext = createContext<I18nContextValue | null>(null);

// Only the locale crosses the server → client boundary; the dictionary is
// resolved here because it contains functions (plurals), which can't be serialized.
export function I18nProvider({ locale, children }: { locale: Locale; children: React.ReactNode }) {
	const value: I18nContextValue = {
		locale,
		t: getDictionary(locale),
		href: (path) => localizePath(locale, path),
	};
	return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nContextValue {
	const value = useContext(I18nContext);
	if (!value) throw new Error('useI18n must be used inside <I18nProvider>');
	return value;
}
