import type { MetadataRoute } from 'next';
import { DEFAULT_LOCALE, LOCALES } from '@/app/lib/i18n/locales';
import { getPublishedPosts } from '@/app/lib/content/posts/post-service';
import { getPublishedProjects } from '@/app/lib/content/projects/project-service';
import { SITE_URL } from '@/app/lib/seo/site';
import { sitemapEntries } from '@/app/lib/seo/sitemap-entries';

// Safety net: saving in the admin already refreshes it through the cache tags.
export const revalidate = 604800;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
	const [projects, ...postsByLocale] = await Promise.all([
		getPublishedProjects(DEFAULT_LOCALE),
		...LOCALES.map((locale) => getPublishedPosts(locale)),
	]);
	// A post in both languages is listed once per language: keep one.
	const posts = [...new Map(postsByLocale.flat().map((p) => [p.slug, p])).values()];
	return sitemapEntries({ siteUrl: SITE_URL, projectSlugs: projects.map((p) => p.slug), posts });
}
