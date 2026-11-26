import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { BackLink } from '@/app/components/BackLink';
import { IArrowLeft } from '@/app/components/icons';
import { Markdown } from '@/app/components/Markdown';
import { resolveLocale } from '@/app/lib/i18n/server';
import { SITE_URL } from '@/app/lib/seo/site';
import { LOCALES, type Locale } from '@/app/lib/i18n/locales';
import { localizePath } from '@/app/lib/i18n/routing';
import type { Dictionary } from '@/app/lib/i18n/dictionaries';
import { getPublishedPost, getPublishedPosts, postRepository } from '@/app/lib/content/posts/post-service';
import { publishedOnly, relatedPosts, type PostView } from '@/app/lib/content/posts/post';
import { highlightMarkdownCode } from '@/app/lib/content/posts/highlight-post';
import { uploadBaseUrl } from '@/app/lib/storage/storage';

export const revalidate = 604800;

type Params = { params: Promise<{ locale: string; slug: string }> };

// Pre-generate every post in each language it was written in.
export async function generateStaticParams() {
	const posts = publishedOnly(await postRepository().listPosts());
	return LOCALES.flatMap((locale) => posts.filter((p) => p.translations[locale]).map((p) => ({ locale, slug: p.slug })));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
	const { locale } = await resolveLocale(params);
	const { slug } = await params;
	const { post } = await getPublishedPost(locale, slug);
	if (!post) return {};

	const url = `${SITE_URL}/${locale}/blog/${slug}`;
	// Relative URLs (local uploads) are resolved against metadataBase.
	const ogImage = post.coverUrl ?? `${SITE_URL}/img/og-image.jpg`;
	return {
		title: post.title,
		description: post.summary,
		alternates: {
			canonical: url,
			languages: Object.fromEntries(post.locales.map((l) => [l, `${SITE_URL}/${l}/blog/${slug}`])),
		},
		openGraph: {
			type: 'article',
			url,
			title: post.title,
			description: post.summary,
			images: [{ url: ogImage, width: 1200, height: 630, alt: post.title }],
			publishedTime: post.publishedOn,
			authors: ['Nelkit Chavez'],
		},
		twitter: { card: 'summary_large_image', title: post.title, description: post.summary, images: [ogImage] },
	};
}

function formatDate(date: string, dateLocale: string) {
	return new Date(`${date}T00:00:00Z`).toLocaleDateString(dateLocale, { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
}

export default async function BlogPostPage({ params }: Params) {
	const { locale, t, href } = await resolveLocale(params);
	const { slug } = await params;

	// Outside any Suspense boundary (and there is no loading.tsx above): the
	// status is still unsent, so these answer with a real 404 / redirect.
	const { post, exists } = await getPublishedPost(locale, slug);
	// Written only in the other language (e.g. after the ES/EN switch) → this language's list.
	if (!post && exists) redirect(localizePath(locale, '/blog'));
	if (!post) notFound();

	return (
		<div className="proj-detail-root">
			<div className="bg-fx" aria-hidden="true">
				<div className="glow" /><div className="glow-2" />
				<div className="grid" /><div className="grain" />
			</div>

			<div className="post-wrap">
				<BackLink href={href('/blog')} className="proj-back">
					<IArrowLeft /> {t.blog.allWriting}
				</BackLink>

				<PostContent post={post} locale={locale} t={t} />
			</div>
		</div>
	);
}

const RELATED_POSTS = 3;

async function PostContent({ post, locale, t }: { post: PostView; locale: Locale; t: Dictionary }) {
	const all = await getPublishedPosts(locale);
	const highlighted = await highlightMarkdownCode(post.body);
	const related = relatedPosts(post, all, RELATED_POSTS);
	const href = (path: string) => localizePath(locale, path);

	return (
		<article className="post-article">
			<header className="post-header">
				<h1 className="post-title">{post.title}</h1>
				{post.summary && <p className="post-summary">{post.summary}</p>}
				<div className="post-meta">
					<span>{formatDate(post.publishedOn, t.meta.dateLocale)}</span>
					<span>{t.blog.minRead(post.readingTime)}</span>
				</div>
			</header>

			{post.coverUrl && (
				<div className="post-cover">
					{/* eslint-disable-next-line @next/next/no-img-element */}
					<img src={post.coverUrl} alt={post.title} className="post-cover-img" />
				</div>
			)}

			<div className="post-body">
				<Markdown highlighted={highlighted} uploadBaseUrl={uploadBaseUrl()}>{post.body}</Markdown>
			</div>

			{related.length > 0 && (
				<aside className="proj-aside post-related">
					<p className="proj-aside-label">{t.blog.related}</p>
					<div className="proj-aside-list">
						{related.map((p) => (
							<Link key={p.slug} href={href(`/blog/${p.slug}`)} className="proj-aside-card">
								{p.coverUrl ? (
									// eslint-disable-next-line @next/next/no-img-element
									<img src={p.coverUrl} alt={p.title} className="proj-aside-thumb" />
								) : (
									<span className="proj-aside-thumb proj-aside-thumb-empty" />
								)}
								<div className="proj-aside-body">
									<span className="proj-aside-area">{p.tags.map((tg) => tg.name).join(' · ')}</span>
									<span className="proj-aside-title">{p.title}</span>
								</div>
							</Link>
						))}
					</div>
				</aside>
			)}
		</article>
	);
}
