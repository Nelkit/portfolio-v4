import Link from 'next/link';
import { getStrapiData } from '@/app/lib/strapi';
import { transformBlogEntries, type BlogEntry } from '@/app/data/content';
import { IArrowUR, IArrowLeft } from '@/app/components/icons';
import qs from 'qs';

export const revalidate = 60;

const PAGE_SIZE = 10;

async function fetchPosts(page: number): Promise<{ posts: BlogEntry[]; total: number }> {
	const strapiUrl = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';
	const query = qs.stringify({
		fields: ['title', 'summary', 'publishedDate', 'readingTime', 'slug'],
		populate: {
			featuredImage: { fields: ['url', 'alternativeText'] },
			blog_tags: { fields: ['title'] },
		},
		sort: ['publishedDate:desc'],
		pagination: { page, pageSize: PAGE_SIZE },
	}, { encodeValuesOnly: true });

	const data = await getStrapiData(`/api/blog-entries?${query}`);
	if (!data?.data) return { posts: [], total: 0 };
	return {
		posts: transformBlogEntries(data.data, strapiUrl),
		total: data.meta?.pagination?.total ?? 0,
	};
}

function formatDate(date: string) {
	if (!date) return '';
	return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

const FALLBACK: BlogEntry[] = [
	{ slug: 'portfolio-v4', title: 'Building Portfolio v4: From Static HTML to an AI Agent Experience', summary: 'A walkthrough of why I rebuilt my portfolio from scratch — ditching the old static layout for a conversational AI agent interface built with Next.js 15, Strapi CMS, and a design system that actually reflects how I think about products.', publishedDate: '2026-05-01', readingTime: 4, tags: ['Next.js', 'Design', 'AI'] },
	{ slug: 'on-device-ml', title: 'Why I bet my career on on-device ML', summary: 'On-device inference is not a constraint — it is a product feature. Here is how I came to see latency as a design surface.', publishedDate: '2026-03-10', readingTime: 6, tags: ['ML', 'Mobile'] },
	{ slug: 'shipping-mobile', title: 'Six rules for shipping mobile at scale', summary: 'Hard-learned heuristics from five years of pushing mobile features to production.', publishedDate: '2026-01-20', readingTime: 9, tags: ['Mobile', 'Process'] },
];

export default async function BlogPage({
	searchParams,
}: {
	searchParams: Promise<{ page?: string }>;
}) {
	const { page: pageParam } = await searchParams;
	const page = Math.max(1, parseInt(pageParam || '1'));
	const { posts, total } = await fetchPosts(page);
	const totalPages = Math.ceil(total / PAGE_SIZE);

	const items = posts.length > 0 ? posts : FALLBACK;
	const [featured, ...rest] = items;

	return (
		<div className="proj-detail-root">
			<div className="bg-fx" aria-hidden="true">
				<div className="glow" /><div className="glow-2" />
				<div className="grid" /><div className="grain" />
			</div>

			<div className="blog-wrap">
				<div className="blog-header">
					<Link href="/#writing" className="proj-back">
						<IArrowLeft /> Back
					</Link>
					<h1 className="blog-heading">Writing<span className="ac">.</span></h1>
					{total > 0 && <p className="blog-subheading">{total} posts · notes on building, mobile &amp; ML</p>}
				</div>

				<div className="blog-grid">
					{featured && (
						<Link href={`/blog/${featured.slug}`} className="blog-card blog-card-feat">
							{featured.coverImage && (
								<div className="blog-card-img">
									<img src={featured.coverImage} alt={featured.title} />
								</div>
							)}
							<div className="blog-card-body">
								<div className="blog-card-meta">
									<span className="blog-card-date">{formatDate(featured.publishedDate)}</span>
									{featured.readingTime > 0 && <span className="blog-card-read">{featured.readingTime} min read</span>}
								</div>
								<h2 className="blog-card-title">{featured.title}</h2>
								<p className="blog-card-summary">{featured.summary}</p>
								{featured.tags.length > 0 && (
									<div className="blog-card-tags">
										{featured.tags.map((t) => <span key={t} className="blog-card-tag">{t}</span>)}
									</div>
								)}
							</div>
							<span className="blog-card-go"><IArrowUR /></span>
						</Link>
					)}

					{rest.map((p, idx) => {
						const spans = ['span 1', 'span 1', 'span 2', 'span 1', 'span 1', 'span 1', 'span 1', 'span 2', 'span 1'];
						const colSpan = spans[idx % spans.length];
						return (
							<Link
								key={p.slug}
								href={`/blog/${p.slug}`}
								className="blog-card"
								style={{ gridColumn: colSpan }}
							>
								{p.coverImage && (
									<div className="blog-card-img">
										<img src={p.coverImage} alt={p.title} />
									</div>
								)}
								<div className="blog-card-body">
									<div className="blog-card-meta">
										<span className="blog-card-date">{formatDate(p.publishedDate)}</span>
										{p.readingTime > 0 && <span className="blog-card-read">{p.readingTime} min</span>}
									</div>
									<h2 className="blog-card-title">{p.title}</h2>
									<p className="blog-card-summary">{p.summary}</p>
									{p.tags.length > 0 && (
										<div className="blog-card-tags">
											{p.tags.map((t) => <span key={t} className="blog-card-tag">{t}</span>)}
										</div>
									)}
								</div>
								<span className="blog-card-go"><IArrowUR /></span>
							</Link>
						);
					})}
				</div>

				{totalPages > 1 && (
					<div className="blog-pagination">
						{page > 1 && (
							<Link href={`/blog?page=${page - 1}`} className="btn btn-outline">
								<IArrowLeft /> Previous
							</Link>
						)}
						<span className="blog-page-info">{page} / {totalPages}</span>
						{page < totalPages && (
							<Link href={`/blog?page=${page + 1}`} className="btn btn-outline">
								Next <IArrowUR />
							</Link>
						)}
					</div>
				)}
			</div>
		</div>
	);
}
