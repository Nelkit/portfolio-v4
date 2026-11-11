'use client';

import type { EducationView } from '@/app/lib/content/education/education';
import { useI18n } from '@/app/lib/i18n/I18nProvider';

type EducationSectionProps = {
	education: EducationView[];
};

export function EducationSection({ education }: EducationSectionProps) {
	const { t } = useI18n();
	const copy = t.sections.education;
	if (!education.length) return null;

	return (
		<section id="education" className="section">
			<div className="sec-head">
				<h2><span className="num">05</span> {copy.title}<span className="ac">.</span></h2>
				<span className="note">{copy.note}</span>
			</div>

			<div className="edu-list">
				<div className="edu-row h">
					<span>{copy.period}</span>
					<span>{copy.degree}</span>
					<span>{copy.institution}</span>
					<span>{copy.status}</span>
				</div>
				{education.map((edu) => (
					<div className="edu-row" key={edu.id}>
						<span className="edu-period">{edu.period}</span>
						<span className="edu-role">
							<b>{edu.degree}</b>
							{edu.description && <span>{edu.description}</span>}
						</span>
						<span className="edu-org">{edu.institution}</span>
						<span className={'badge' + (edu.inProgress ? ' cur' : '')}>
							{edu.inProgress ? copy.inProgress : copy.completed}
						</span>
					</div>
				))}
			</div>
		</section>
	);
}
