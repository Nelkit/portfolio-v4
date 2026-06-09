import { type CareerTimelineItem } from '@/app/data/content';

type CareerSectionProps = {
	title: string;
	careerTimeline: CareerTimelineItem[];
};

export function CareerSection({ title, careerTimeline }: CareerSectionProps) {
	const rows = careerTimeline.map((c) => ({
		period: c.period,
		title: c.title,
		detail: c.detail,
		org: c.detail,
		cur: c.period.toLowerCase().includes('now') || c.period.toLowerCase().includes('present'),
	}));

	if (rows.length === 0) return null;

	const startYear = rows.length > 0
		? (parseInt(rows[rows.length - 1].period.match(/\d{4}/)?.[0] ?? '2016') || 2016)
		: 2016;
	const totalYears = 2026 - startYear;

	return (
		<section id="career" className="section">
			<div className="sec-head">
				<h2><span className="num">04</span> {title}<span className="ac">.</span></h2>
				<span className="note">{totalYears} years of receipts</span>
			</div>

			<div className="career-table">
				<div className="career-row h">
					<span>Period</span>
					<span>Role</span>
					<span>Organisation</span>
					<span>Status</span>
				</div>
				{rows.map((c) => (
					<div className="career-row" key={c.period + c.title}>
						<span className="period">{c.period}</span>
						<span className="role">
							<b>{c.title}</b>
							<span>{c.detail}</span>
						</span>
						<span className="org">{c.org}</span>
						<span className={'badge' + (c.cur ? ' cur' : '')}>{c.cur ? 'Current' : 'Past'}</span>
					</div>
				))}
			</div>
		</section>
	);
}
