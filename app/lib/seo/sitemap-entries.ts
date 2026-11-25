import type { MetadataRoute } from 'next';
import { LOCALES, type Locale } from '@/app/lib/i18n/locales';
import { localizePath } from '@/app/lib/i18n/routing';

type SitemapContent = {
	siteUrl: string;
	/** Every project page exists in every language. */
	projectSlugs: string[];
	/** Posts only exist in the languages they were written in. */
	posts: { slug: string; locales: readonly Locale[]; publishedOn: string }[];
};

export function sitemapEntries({ siteUrl, projectSlugs, posts }: SitemapContent): MetadataRoute.Sitemap {
	const url = (locale: Locale, path: string) => siteUrl + localizePath(locale, path);
	const page = (path: string, locales: readonly Locale[], lastModified?: string): MetadataRoute.Sitemap =>
		locales.map((locale) => ({
			url: url(locale, path),
			...(lastModified ? { lastModified } : {}),
			alternates: { languages: Object.fromEntries(locales.map((l) => [l, url(l, path)])) },
		}));

	// An empty blog list is not worth indexing.
	const blogLocales = LOCALES.filter((locale) => posts.some((p) => p.locales.includes(locale)));
	return [
		...page('/', LOCALES),
		...page('/projects', LOCALES),
		...page('/blog', blogLocales),
		...projectSlugs.flatMap((slug) => page(`/projects/${slug}`, LOCALES)),
		...posts.flatMap((p) => page(`/blog/${p.slug}`, p.locales, p.publishedOn)),
	];
}
