import { type CareerTimelineItem } from '@/app/data/content';
import { useI18n } from '@/app/lib/i18n/I18nProvider';

type CareerSectionProps = {
	title: string;
	careerTimeline: CareerTimelineItem[];
};

export function CareerSection({ title, careerTimeline }: CareerSectionProps) {
	const { t } = useI18n();
	const copy = t.sections.career;
	const rows = careerTimeline.map((c) => ({
		period: c.period,
		title: c.title,
		detail: c.detail,
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
				<span className="note">{copy.note(totalYears)}</span>
			</div>

			<div className="career-table">
				<div className="career-row h">
					<span>{copy.period}</span>
					<span>{copy.role}</span>
					<span>{copy.status}</span>
				</div>
				{rows.map((c) => (
					<div className="career-row" key={c.period + c.title}>
						<span className="period">{c.period}</span>
						<span className="role">
							<b>{c.title}</b>
							<span>{c.detail}</span>
						</span>
						<span className={'badge' + (c.cur ? ' cur' : '')}>{c.cur ? copy.current : copy.past}</span>
					</div>
				))}
			</div>
		</section>
	);
}
