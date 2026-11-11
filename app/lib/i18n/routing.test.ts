import { describe, expect, it } from 'vitest';
import {
	getLocaleFromPathname,
	isLocale,
	localizePath,
	negotiateLocale,
	switchLocalePath,
} from './routing';

describe('isLocale', () => {
	it('accepts supported locales only', () => {
		expect(isLocale('en')).toBe(true);
		expect(isLocale('es')).toBe(true);
		expect(isLocale('fr')).toBe(false);
		expect(isLocale(undefined)).toBe(false);
	});
});

describe('negotiateLocale', () => {
	it('prefers a valid cookie (the visitor’s explicit choice)', () => {
		expect(negotiateLocale({ cookie: 'es', acceptLanguage: 'en-US,en;q=0.9' })).toBe('es');
	});

	it('ignores an invalid cookie and falls back to the browser language', () => {
		expect(negotiateLocale({ cookie: 'fr', acceptLanguage: 'es-ES,es;q=0.9' })).toBe('es');
	});

	it('matches the primary subtag of Accept-Language (es-MX → es)', () => {
		expect(negotiateLocale({ acceptLanguage: 'es-MX' })).toBe('es');
	});

	it('respects q-values over header order', () => {
		expect(negotiateLocale({ acceptLanguage: 'en;q=0.5, es;q=0.9' })).toBe('es');
	});

	it('skips unsupported languages to find a supported one', () => {
		expect(negotiateLocale({ acceptLanguage: 'fr-FR, es;q=0.8, en;q=0.7' })).toBe('es');
	});

	it('defaults to English when nothing matches or nothing is sent', () => {
		expect(negotiateLocale({ acceptLanguage: 'fr-FR,de;q=0.9' })).toBe('en');
		expect(negotiateLocale({})).toBe('en');
		expect(negotiateLocale({ acceptLanguage: '' })).toBe('en');
	});
});

describe('getLocaleFromPathname', () => {
	it('reads the locale prefix', () => {
		expect(getLocaleFromPathname('/es')).toBe('es');
		expect(getLocaleFromPathname('/en/blog/my-post')).toBe('en');
	});

	it('returns null without a valid prefix', () => {
		expect(getLocaleFromPathname('/')).toBeNull();
		expect(getLocaleFromPathname('/blog')).toBeNull();
		expect(getLocaleFromPathname('/esx/blog')).toBeNull();
	});
});

describe('localizePath', () => {
	it('prefixes paths with the locale', () => {
		expect(localizePath('es', '/')).toBe('/es');
		expect(localizePath('es', '/blog')).toBe('/es/blog');
		expect(localizePath('en', '/projects/abc')).toBe('/en/projects/abc');
	});

	it('keeps query strings and hashes attached correctly', () => {
		expect(localizePath('es', '/blog?page=2')).toBe('/es/blog?page=2');
		expect(localizePath('es', '/#work')).toBe('/es#work');
		expect(localizePath('en', '/?x=1')).toBe('/en?x=1');
	});
});

describe('switchLocalePath', () => {
	it('swaps the locale prefix and keeps the rest of the path', () => {
		expect(switchLocalePath('/en/blog/my-post', 'es')).toBe('/es/blog/my-post');
		expect(switchLocalePath('/es', 'en')).toBe('/en');
	});

	it('adds a prefix when the path has none', () => {
		expect(switchLocalePath('/blog', 'es')).toBe('/es/blog');
	});
});
