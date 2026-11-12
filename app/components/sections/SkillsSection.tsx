'use client';

import { useState } from 'react';
import { navNumber } from '@/app/lib/nav';
import { countUniqueSkills, type CategoryView } from '@/app/lib/content/skills/skill-category';
import { useI18n } from '@/app/lib/i18n/I18nProvider';

type SkillsSectionProps = {
	categories: CategoryView[];
};

export function SkillsSection({ categories }: SkillsSectionProps) {
	const { t } = useI18n();
	const [activeId, setActiveId] = useState<number | null>(categories[0]?.id ?? null);
	if (categories.length === 0) return null;

	// A skill listed in several categories counts once.
	const totalTools = countUniqueSkills(categories);
	const active = categories.find((c) => c.id === activeId) ?? categories[0];

	return (
		<section id="stack" className="section">
			<div className="sec-head">
				<h2><span className="num">{navNumber('stack')}</span> {t.sections.stack.title}<span className="ac">.</span></h2>
				<span className="note">{t.sections.stack.note(totalTools)}</span>
			</div>

			<div className="stack-tabs">
				{categories.map((c) => (
					<button
						key={c.id}
						className={'stack-tab' + (active.id === c.id ? ' on' : '')}
						onClick={() => setActiveId(c.id)}
					>
						{c.name}<span className="c">{String(c.skills.length).padStart(2, '0')}</span>
					</button>
				))}
			</div>

			<div className="tool-grid">
				{active.skills.map((tool) => (
					<span className="tool" key={tool}>{tool}</span>
				))}
			</div>
		</section>
	);
}
