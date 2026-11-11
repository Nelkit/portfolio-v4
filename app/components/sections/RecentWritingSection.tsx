import Link from 'next/link';
import { type BlogEntry } from '@/app/data/content';
import { IArrowUR } from '@/app/components/icons';
import { useI18n } from '@/app/lib/i18n/I18nProvider';

function formatDate(date: string, dateLocale: string) {
	if (!date) return '';
	return new Date(date).toLocaleDateString(dateLocale, { month: 'short', year: 'numeric' });
}

export function RecentWritingSection({ posts }: { posts: BlogEntry[] }) {
	const { t, href } = useI18n();
	const copy = t.sections.writing;
	return (
		<section id="writing" className="section">
			<div className="sec-head">
				<h2><span className="num">06</span> {copy.title}<span className="ac">.</span></h2>
				<span className="note">{copy.note}</span>
			</div>

			<div className="write-list">
				{posts.map((p) => (
					<Link key={p.slug} className="write-row" href={href(`/blog/${p.slug}`)}>
						<span className="wr-date">{formatDate(p.publishedDate, t.meta.dateLocale)}</span>
						<span className="wr-body">
							<span className="wr-title">{p.title}</span>
							{p.tags.length > 0 && (
								<span className="wr-tags">
									{p.tags.map((t) => <span key={t} className="wr-tag">{t}</span>)}
								</span>
							)}
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
