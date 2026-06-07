import { type EducationItem } from '@/app/data/content';

type EducationSectionProps = {
	education: EducationItem[];
};

export function EducationSection({ education }: EducationSectionProps) {
	if (!education.length) return null;

	return (
		<section id="education" className="section">
			<div className="sec-head">
				<h2><span className="num">05</span> Education<span className="ac">.</span></h2>
				<span className="note">Plus scholarships</span>
			</div>

			<div className="edu-list">
				<div className="edu-row h">
					<span>Period</span>
					<span>Degree</span>
					<span>Institution</span>
					<span>Status</span>
				</div>
				{education.map((edu) => (
					<div className="edu-row" key={edu.degree}>
						<span className="edu-period">{edu.period}</span>
						<span className="edu-role">
							<b>{edu.degree}</b>
							{edu.description && <span>{edu.description}</span>}
						</span>
						<span className="edu-org">{edu.institution}</span>
						<span className={'badge' + (edu.status === 'In Progress' ? ' cur' : '')}>
							{edu.status === 'In Progress' ? 'In Progress' : 'Completed'}
						</span>
					</div>
				))}
			</div>
		</section>
	);
}
