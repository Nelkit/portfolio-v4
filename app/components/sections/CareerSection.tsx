import { type CareerTimelineItem } from '@/app/data/content';

type CareerSectionProps = {
	careerTimeline: CareerTimelineItem[];
};

const FALLBACK_CAREER = [
	{ period: '2024 — Now', title: 'Researcher · Grad Student',  detail: 'Applied ML for mobile UX, on-device intelligence.',    org: 'University of Technology Sydney', cur: true },
	{ period: '2021 — 2024', title: 'Senior Mobile Engineer',    detail: 'Led the iOS team. Shipped a payments redesign across 6 markets.', org: 'Confidential · Fintech', cur: false },
	{ period: '2019 — 2021', title: 'Mobile Engineer',           detail: 'Owned the driver app rewrite (React Native → native).', org: 'Confidential · Logistics', cur: false },
	{ period: '2017 — 2019', title: 'Mobile Developer',          detail: 'Industrial safety mobile suite for offshore crews.',    org: 'Locstatt', cur: false },
	{ period: '2016 — 2017', title: 'Mobile & Web Developer',    detail: 'First job out of uni — agency work, lots of bandwidth.', org: 'Crayon Star', cur: false },
];

export function CareerSection({ careerTimeline }: CareerSectionProps) {
	const rows =
		careerTimeline.length > 0
			? careerTimeline.map((c) => ({
				period: c.period,
				title: c.title,
				detail: c.detail,
				org: c.detail,
				cur: c.period.toLowerCase().includes('now') || c.period.toLowerCase().includes('present'),
			}))
			: FALLBACK_CAREER;

	const startYear = rows.length > 0
		? (parseInt(rows[rows.length - 1].period.match(/\d{4}/)?.[0] ?? '2016') || 2016)
		: 2016;
	const totalYears = 2026 - startYear;

	return (
		<section id="career" className="section">
			<div className="sec-head">
				<h2><span className="num">04</span> Career<span className="ac">.</span></h2>
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
