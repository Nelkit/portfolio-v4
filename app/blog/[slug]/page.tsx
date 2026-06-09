import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getStrapiData } from '@/app/lib/strapi';
import { mediaUrl } from '@/app/lib/constant';
import { IArrowLeft } from '@/app/components/icons';
import qs from 'qs';

export const revalidate = 3600;

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

function inlineMarkdown(text: string): string {
	return text
		.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
		.replace(/\*(.+?)\*/g, '<em>$1</em>')
		.replace(/`(.+?)`/g, '<code>$1</code>');
}

function renderBody(body: any): string {
	if (!body) return '';
	if (typeof body === 'string') return `<p>${inlineMarkdown(body)}</p>`;
	if (!Array.isArray(body)) return '';

	const blocks: string[] = [];

	for (const block of body) {
		if (block.type === 'paragraph') {
			const raw = block.children?.map((c: any) => {
				let t = c.text || '';
				if (c.bold) t = `<strong>${t}</strong>`;
				if (c.italic) t = `<em>${t}</em>`;
				if (c.code) t = `<code>${t}</code>`;
				return t;
			}).join('') || '';

			const parsed = inlineMarkdown(raw);
			if (!parsed.trim()) continue;

			// Detect markdown list items inside a paragraph block
			if (parsed.startsWith('- ')) {
				const item = parsed.slice(2);
				// group consecutive list items
				const last = blocks[blocks.length - 1];
				if (last?.startsWith('<ul>') && !last.endsWith('</ul>')) {
					blocks[blocks.length - 1] += `<li>${item}</li>`;
				} else {
					blocks.push(`<ul><li>${item}</li>`);
				}
				continue;
			}
			// Close any open <ul>
			if (blocks.length && blocks[blocks.length - 1].startsWith('<ul>') && !blocks[blocks.length - 1].endsWith('</ul>')) {
				blocks[blocks.length - 1] += '</ul>';
			}
			blocks.push(`<p>${parsed}</p>`);
		} else if (block.type === 'heading') {
			const level = block.level || 2;
			const text = inlineMarkdown(block.children?.map((c: any) => c.text || '').join('') || '');
			blocks.push(`<h${level}>${text}</h${level}>`);
		} else if (block.type === 'list') {
			const tag = block.format === 'ordered' ? 'ol' : 'ul';
			const items = block.children?.map((item: any) => {
				const text = inlineMarkdown(item.children?.map((c: any) => c.text || '').join('') || '');
				return `<li>${text}</li>`;
			}).join('') || '';
			blocks.push(`<${tag}>${items}</${tag}>`);
		} else if (block.type === 'quote') {
			const text = inlineMarkdown(block.children?.map((c: any) => c.text || '').join('') || '');
			blocks.push(`<blockquote>${text}</blockquote>`);
		} else if (block.type === 'code') {
			const text = block.children?.map((c: any) => c.text || '').join('') || '';
			blocks.push(`<pre><code>${text}</code></pre>`);
		}
	}

	// Close any trailing open <ul>
	if (blocks.length && blocks[blocks.length - 1].startsWith('<ul>') && !blocks[blocks.length - 1].endsWith('</ul>')) {
		blocks[blocks.length - 1] += '</ul>';
	}

	return blocks.join('\n');
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
	const { slug } = await params;
	const post = await fetchPost(slug);

	if (!post) notFound();

	const bodyHtml = renderBody(post.body);

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

					{bodyHtml ? (
						<div
							className="post-body"
							dangerouslySetInnerHTML={{ __html: bodyHtml }}
						/>
					) : (
						<p className="post-body" style={{ color: 'var(--text-faint)', fontStyle: 'italic' }}>
							Content coming soon.
						</p>
					)}
				</article>
			</div>
		</div>
	);
}
