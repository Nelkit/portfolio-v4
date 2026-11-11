'use client';

import type { CareerView } from '@/app/lib/content/career/career';
import { useI18n } from '@/app/lib/i18n/I18nProvider';

type CareerSectionProps = {
	title: string;
	entries: CareerView[];
	/** Full years since the earliest role. */
	years: number;
};

export function CareerSection({ title, entries, years }: CareerSectionProps) {
	const { t } = useI18n();
	const copy = t.sections.career;

	if (entries.length === 0) return null;

	return (
		<section id="career" className="section">
			<div className="sec-head">
				<h2><span className="num">04</span> {title}<span className="ac">.</span></h2>
				<span className="note">{copy.note(years)}</span>
			</div>

			<div className="career-table">
				<div className="career-row h">
					<span>{copy.period}</span>
					<span>{copy.role}</span>
					<span>{copy.status}</span>
				</div>
				{entries.map((c) => (
					<div className="career-row" key={c.id}>
						<span className="period">{c.period}</span>
						<span className="role">
							<b>{c.title}</b>
							{c.detail && <span>{c.detail}</span>}
						</span>
						<span className={'badge' + (c.current ? ' cur' : '')}>{c.current ? copy.current : copy.past}</span>
					</div>
				))}
			</div>
		</section>
	);
}
