import { Suspense } from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getStrapiData } from '@/app/lib/strapi';
import { mediaUrl } from '@/app/lib/constant';
import { IArrowLeft } from '@/app/components/icons';
import { PostBody } from '@/app/components/PostBody';
import { highlightCode } from '@/app/lib/highlight';
import type { BlocksContent } from '@strapi/blocks-react-renderer';
import qs from 'qs';

export const revalidate = 3600;

// Pre-generate every blog post at build time so clicks are instant.
// New posts published later are rendered on-demand and then cached (ISR).
export async function generateStaticParams() {
	const query = qs.stringify({
		fields: ['slug'],
		pagination: { pageSize: 100 },
	}, { encodeValuesOnly: true });
	const data = await getStrapiData(`/api/blog-entries?${query}`);
	return (data?.data ?? [])
		.filter((p: { slug?: string }) => p.slug)
		.map((p: { slug: string }) => ({ slug: p.slug }));
}

export async function generateMetadata(
	{ params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
	const { slug } = await params;
	const post = await fetchPost(slug);
	if (!post) return {};

	const url = `https://nelkit.dev/blog/${slug}`;
	const ogImage = post.coverImage || 'https://nelkit.dev/img/og-image.jpg';

	return {
		title: post.title,
		description: post.summary,
		alternates: { canonical: url },
		openGraph: {
			type: 'article',
			url,
			title: post.title,
			description: post.summary,
			images: [{ url: ogImage, width: 1200, height: 630, alt: post.title }],
			publishedTime: post.publishedDate,
			authors: ['Nelkit Chavez'],
			tags: post.tags,
		},
		twitter: {
			card: 'summary_large_image',
			title: post.title,
			description: post.summary,
			images: [ogImage],
		},
	};
}

async function fetchPost(slug: string) {
	const query = qs.stringify({
		filters: { slug: { $eq: slug } },
		fields: ['title', 'summary', 'body', 'publishedDate', 'readingTime', 'slug'],
		populate: {
			featuredImage: { fields: ['url', 'alternativeText'] },
			blog_tags: { fields: ['title'] },
		},
	}, { encodeValuesOnly: true });

	const data = await getStrapiData(`/api/blog-entries?${query}`, 3600);
	const entry = data?.data?.[0] ?? null;
	if (!entry) return null;

	return {
		slug: entry.slug || entry.documentId,
		title: entry.title,
		summary: entry.summary || '',
		body: entry.body || '',
		publishedDate: entry.publishedDate || '',
		readingTime: entry.readingTime || 0,
		tags: Array.isArray(entry.blog_tags) ? entry.blog_tags.map((t: any) => t.title || t) : [],
		coverImage: mediaUrl(entry.featuredImage?.url) || null,
		coverAlt: entry.featuredImage?.alternativeText || entry.title,
	};
}

function formatDate(date: string) {
	if (!date) return '';
	return new Date(date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}


// The page shell renders INSTANTLY: background + Suspense boundary. The data
// fetch lives in <PostContent>, so navigation completes immediately and the
// user sees the skeleton (loading.tsx fallback) right away — instead of waiting
// on the home page while Strapi (possibly cold-starting) responds.
export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
	const { slug } = await params;

	return (
		<div className="proj-detail-root">
			<div className="bg-fx" aria-hidden="true">
				<div className="glow" /><div className="glow-2" />
				<div className="grid" /><div className="grain" />
			</div>

			<div className="post-wrap">
				<Link href="/blog" className="proj-back">
					<IArrowLeft /> All writing
				</Link>

				<Suspense fallback={<PostSkeleton />}>
					<PostContent slug={slug} />
				</Suspense>
			</div>
		</div>
	);
}

// Async data-dependent part — this is what Suspense waits on. While the fetch
// (and code highlighting) runs, the fallback skeleton is shown and streamed in.
async function PostContent({ slug }: { slug: string }) {
	const post = await fetchPost(slug);

	if (!post) notFound();

	const blocks: BlocksContent | null = Array.isArray(post.body) ? (post.body as BlocksContent) : null;

	// Pre-highlight every code block on the server, keyed by the raw code text.
	// Keying by content (not index) guarantees the client looks it up the same
	// way → no SSR/CSR hydration mismatch.
	const highlighted: Record<string, string> = {};
	if (blocks) {
		await Promise.all(
			blocks.map(async (block) => {
				if (block.type === 'code') {
					const text = block.children?.map((c) => ('text' in c ? c.text : '')).join('') ?? '';
					const lang = (block as { language?: string }).language;
					highlighted[text] = await highlightCode(text, lang);
				}
			}),
		);
	}

	return (
		<article className="post-article">
			<header className="post-header">
				{post.tags.length > 0 && (
					<div className="post-tags">
						{post.tags.map((t: string) => (
							<span key={t} className="blog-card-tag">{t}</span>
						))}
					</div>
				)}
				<h1 className="post-title">{post.title}</h1>
				{post.summary && <p className="post-summary">{post.summary}</p>}
				<div className="post-meta">
					{post.publishedDate && <span>{formatDate(post.publishedDate)}</span>}
					{post.readingTime > 0 && <span>{post.readingTime} min read</span>}
				</div>
			</header>

			{post.coverImage && (
				<div className="post-cover">
					<img src={post.coverImage} alt={post.coverAlt} className="post-cover-img" />
				</div>
			)}

			{blocks && blocks.length > 0 ? (
				<div className="post-body">
					<PostBody content={blocks} highlighted={highlighted} />
				</div>
			) : (
				<p className="post-body" style={{ color: 'var(--text-faint)', fontStyle: 'italic' }}>
					Content coming soon.
				</p>
			)}
		</article>
	);
}

// Inline skeleton shown while PostContent streams in. Mirrors loading.tsx but
// scoped to the article (the shell — bg + back link — is already on screen).
function PostSkeleton() {
	return (
		<article className="post-article">
			<header className="post-header">
				<div className="skel-row">
					<div className="skeleton skel-chip" />
					<div className="skeleton skel-chip" />
				</div>
				<div className="skeleton skel-title" />
				<div className="skeleton skel-line" style={{ width: '70%' }} />
			</header>
			<div className="skeleton skel-image" />
			<div className="skeleton skel-line" />
			<div className="skeleton skel-line" />
			<div className="skeleton skel-line" style={{ width: '92%' }} />
			<div className="skeleton skel-line" style={{ width: '50%' }} />
		</article>
	);
}
