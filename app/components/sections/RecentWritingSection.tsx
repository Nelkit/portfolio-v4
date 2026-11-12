import Link from 'next/link';
import type { PostSummary } from '@/app/lib/content/posts/post';
import { navNumber } from '@/app/lib/nav';
import { IArrowUR } from '@/app/components/icons';
import { useI18n } from '@/app/lib/i18n/I18nProvider';

/** 'YYYY-MM-DD' calendar date, formatted in UTC so it never shifts a day. */
function formatDate(date: string, dateLocale: string) {
	if (!date) return '';
	return new Date(`${date}T00:00:00Z`).toLocaleDateString(dateLocale, { month: 'short', year: 'numeric', timeZone: 'UTC' });
}

export function RecentWritingSection({ posts }: { posts: PostSummary[] }) {
	const { t, href } = useI18n();
	const copy = t.sections.writing;
	return (
		<section id="writing" className="section">
			<div className="sec-head">
				<h2><span className="num">{navNumber('writing')}</span> {copy.title}<span className="ac">.</span></h2>
				<span className="note">{copy.note}</span>
			</div>

			<div className="write-list">
				{posts.map((p) => (
					<Link key={p.slug} className="write-row" href={href(`/blog/${p.slug}`)}>
						<span className="wr-date">{formatDate(p.publishedOn, t.meta.dateLocale)}</span>
						<span className="wr-body">
							<span className="wr-title">{p.title}</span>
						</span>
						<span className="wr-read">{p.readingTime > 0 ? copy.minutes(p.readingTime) : ''} <IArrowUR /></span>
					</Link>
				))}
			</div>

			<div className="write-foot">
				<Link href={href('/blog')} className="btn btn-outline write-all">
					{copy.viewAll} <IArrowUR />
				</Link>
			</div>
		</section>
	);
}
