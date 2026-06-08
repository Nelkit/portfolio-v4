import Link from 'next/link';
import { type BlogEntry } from '@/app/data/content';
import { IArrowUR } from '@/app/components/icons';

function formatDate(date: string) {
	if (!date) return '';
	return new Date(date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

export function RecentWritingSection({ posts }: { posts: BlogEntry[] }) {
	return (
		<section id="writing" className="section">
			<div className="sec-head">
				<h2><span className="num">06</span> Recent writing<span className="ac">.</span></h2>
				<span className="note">notes on building, mobile &amp; ML</span>
			</div>

			<div className="write-list">
				{posts.map((p) => (
					<Link key={p.slug} className="write-row" href={`/blog/${p.slug}`}>
						<span className="wr-date">{formatDate(p.publishedDate)}</span>
						<span className="wr-body">
							<span className="wr-title">{p.title}</span>
							{p.tags.length > 0 && (
								<span className="wr-tags">
									{p.tags.map((t) => <span key={t} className="wr-tag">{t}</span>)}
								</span>
							)}
						</span>
						<span className="wr-read">{p.readingTime > 0 ? `${p.readingTime} min` : ''} <IArrowUR /></span>
					</Link>
				))}
			</div>

			<div className="write-foot">
				<Link href="/blog" className="btn btn-outline write-all">
					View all writing <IArrowUR />
				</Link>
			</div>
		</section>
	);
}
