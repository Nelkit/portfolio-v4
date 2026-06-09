'use client';

import { useState } from 'react';
import { type SkillCategory } from '@/app/data/content';

type SkillsSectionProps = {
	skillCategories: SkillCategory[];
};

export function SkillsSection({ skillCategories }: SkillsSectionProps) {
	if (skillCategories.length === 0) return null;

	const stacks: Record<string, string[]> = Object.fromEntries(
		skillCategories.map((c) => [c.label, c.skills]),
	);

	const tabs = Object.keys(stacks);
	const totalTools = Object.values(stacks).reduce((a, b) => a + b.length, 0);

	const [activeTab, setActiveTab] = useState(tabs[0] ?? '');

	return (
		<section id="stack" className="section">
			<div className="sec-head">
				<h2><span className="num">03</span> Tech stack<span className="ac">.</span></h2>
				<span className="note">{totalTools} tools · grouped by domain</span>
			</div>

			<div className="stack-tabs">
				{tabs.map((k) => (
					<button
						key={k}
						className={'stack-tab' + (activeTab === k ? ' on' : '')}
						onClick={() => setActiveTab(k)}
					>
						{k}<span className="c">{String(stacks[k].length).padStart(2, '0')}</span>
					</button>
				))}
			</div>

			<div className="tool-grid">
				{(stacks[activeTab] ?? []).map((tool) => (
					<span className="tool" key={tool}>{tool}</span>
				))}
			</div>
		</section>
	);
}
