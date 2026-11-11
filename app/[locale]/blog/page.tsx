import Link from 'next/link';
import { IArrowUR, IArrowLeft } from '@/app/components/icons';
import { resolveLocale } from '@/app/lib/i18n/server';
import { getPublishedPosts } from '@/app/lib/content/posts/post-service';

export const revalidate = 604800;

const PAGE_SIZE = 10;

function formatDate(date: string, dateLocale: string) {
	if (!date) return '';
	// 'YYYY-MM-DD' is a calendar date: format it in UTC so it never shifts a day.
	return new Date(`${date}T00:00:00Z`).toLocaleDateString(dateLocale, { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
}

export default async function BlogPage({
	params,
	searchParams,
}: {
	params: Promise<{ locale: string }>;
	searchParams: Promise<{ page?: string }>;
}) {
	const { locale, t, href } = await resolveLocale(params);
	const copy = t.blog;
	const { page: pageParam } = await searchParams;
	const all = await getPublishedPosts(locale);
	const total = all.length;
	const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
	const page = Math.min(totalPages, Math.max(1, parseInt(pageParam || '1') || 1));
	const posts = all.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

	const [featured, ...rest] = posts;

	return (
		<div className="proj-detail-root">
			<div className="bg-fx" aria-hidden="true">
				<div className="glow" /><div className="glow-2" />
				<div className="grid" /><div className="grain" />
			</div>

			<div className="blog-wrap">
				<div className="blog-header">
					<Link href={href('/#writing')} className="proj-back">
						<IArrowLeft /> {t.common.back}
					</Link>
					<h1 className="blog-heading">{copy.heading}<span className="ac">.</span></h1>
					{posts.length === 0 && (
						<p className="blog-subheading" style={{ opacity: 0.5 }}>{copy.empty}</p>
					)}
					{total > 0 && <p className="blog-subheading">{copy.count(total)}</p>}
				</div>

				<div className="blog-grid">
					{featured && (
						<Link href={href(`/blog/${featured.slug}`)} className="blog-card blog-card-feat">
							<div className="blog-card-body">
								<div className="blog-card-meta">
									<span className="blog-card-date">{formatDate(featured.publishedOn, t.meta.dateLocale)}</span>
									<span className="blog-card-read">{copy.minRead(featured.readingTime)}</span>
								</div>
								<h2 className="blog-card-title">{featured.title}</h2>
								{featured.summary && <p className="blog-card-summary">{featured.summary}</p>}
							</div>
							<span className="blog-card-go"><IArrowUR /></span>
						</Link>
					)}

					{rest.map((p, idx) => {
						const spans = ['span 1', 'span 1', 'span 2', 'span 1', 'span 1', 'span 1', 'span 1', 'span 2', 'span 1'];
						return (
							<Link
								key={p.slug}
								href={href(`/blog/${p.slug}`)}
								className="blog-card"
								style={{ gridColumn: spans[idx % spans.length] }}
							>
								<div className="blog-card-body">
									<div className="blog-card-meta">
										<span className="blog-card-date">{formatDate(p.publishedOn, t.meta.dateLocale)}</span>
										<span className="blog-card-read">{copy.minutes(p.readingTime)}</span>
									</div>
									<h2 className="blog-card-title">{p.title}</h2>
									{p.summary && <p className="blog-card-summary">{p.summary}</p>}
								</div>
								<span className="blog-card-go"><IArrowUR /></span>
							</Link>
						);
					})}
				</div>

				{totalPages > 1 && (
					<div className="blog-pagination">
						{page > 1 && (
							<Link href={href(`/blog?page=${page - 1}`)} className="btn btn-outline">
								<IArrowLeft /> {copy.previous}
							</Link>
						)}
						<span className="blog-page-info">{page} / {totalPages}</span>
						{page < totalPages && (
							<Link href={href(`/blog?page=${page + 1}`)} className="btn btn-outline">
								{copy.next} <IArrowUR />
							</Link>
						)}
					</div>
				)}
			</div>
		</div>
	);
}
