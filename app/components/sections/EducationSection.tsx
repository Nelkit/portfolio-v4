'use client';

import type { EducationView } from '@/app/lib/content/education/education';
import { ISpark } from '@/app/components/icons';
import { navNumber } from '@/app/lib/nav';
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
				<h2><span className="num">{navNumber('education')}</span> {copy.title}<span className="ac">.</span></h2>
			</div>

			<div className="edu-list">
				<div className="edu-row h">
					<span>{copy.period}</span>
					<span>{copy.degree}</span>
					<span>{copy.institution}</span>
					<span>{copy.honours}</span>
				</div>
				{education.map((edu) => (
					<div className="edu-row" key={edu.id}>
						<span className="edu-period">{edu.period}</span>
						<span className="edu-role">
							<b>{edu.degree}</b>
							{edu.description && <span>{edu.description}</span>}
						</span>
						<span className="edu-org">{edu.institution}</span>
						{/* Honours: the award badge, and "In progress" while ongoing ("Completed" said nothing). */}
						<span className="edu-badges">
							{edu.award && <span className="badge cur">{edu.award}</span>}
							{edu.inProgress && <span className="badge">{copy.inProgress}</span>}
						</span>
						{/* Highlight (e.g. the scholarship): its own full-width row, styled as a pull quote. */}
						{edu.note && (
							<p className="edu-note">
								<ISpark />
								<span>{edu.note}</span>
							</p>
						)}
					</div>
				))}
			</div>
		</section>
	);
}
