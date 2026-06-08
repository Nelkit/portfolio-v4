'use client';

import { useState } from 'react';
import { type SkillCategory } from '@/app/data/content';

type SkillsSectionProps = {
	skillCategories: SkillCategory[];
};

const FALLBACK_STACKS: Record<string, string[]> = {
	Mobile:  ['Swift', 'SwiftUI', 'Kotlin', 'Flutter', 'React Native', 'CoreML'],
	Backend: ['FastAPI', 'Django', 'Postgres', 'Redis', 'WebSockets', 'Docker'],
	'AI/ML': ['Python', 'TensorFlow', 'LangChain', 'CoreML', 'PyTorch', 'RAG'],
	Web:     ['React', 'TypeScript', 'Vite', 'Tailwind', 'Node'],
};

export function SkillsSection({ skillCategories }: SkillsSectionProps) {
	const stacks: Record<string, string[]> =
		skillCategories.length > 0
			? Object.fromEntries(skillCategories.map((c) => [c.label, c.skills]))
			: FALLBACK_STACKS;

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
