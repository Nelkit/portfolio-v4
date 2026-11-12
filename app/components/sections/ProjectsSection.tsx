'use client';

import Link from 'next/link';
import { navNumber } from '@/app/lib/nav';
import { useState } from 'react';
import { AreaFilter, areaChips } from '@/app/components/AreaFilter';
import { type Project, type ProjectLink } from '@/app/data/content';
import { IArrowUR, IGithub, ILinkedin, IMail } from '@/app/components/icons';
import { useI18n } from '@/app/lib/i18n/I18nProvider';

const ILinkIcon = () => (
	<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="13" height="13">
		<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
		<path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
	</svg>
);

const LINK_ICONS: Record<string, () => React.ReactElement> = {
	github:   IGithub,
	linkedin: ILinkedin,
	email:    IMail,
	link:     ILinkIcon,
};

type ProjectsSectionProps = {
	title: string;
	projects: Project[];
	areas: { id: number; name: string }[];
	onNav: (id: string) => void;
};

type CardItem = {
	slug: string;
	i: string;
	k: string;
	t: string;
	d: string;
	tags: string;
	image: string;
	links: ProjectLink[];
};

export function ProjectsSection({ title, projects, areas }: ProjectsSectionProps) {
	const { t, href } = useI18n();
	const [selectedArea, setSelectedArea] = useState<number | null>(null);
	const withArea = projects.map((p) => ({ ...p, areaId: p.areaId ?? null }));
	const chips = areaChips(areas, withArea);
	const visible = selectedArea === null ? withArea : withArea.filter((p) => p.areaId === selectedArea);

	const items: CardItem[] = visible.map((p, idx) => ({
		slug: p.slug,
		i: String(idx + 1).padStart(2, '0'),
		k: p.expertise_area || '',
		t: p.title,
		d: p.summary || p.description,
		tags: p.tech.join(' · '),
		image: p.image,
		links: p.links || [],
	}));

	if (projects.length === 0) return null;

	const count = projects.length;

	return (
		<section id="work" className="section section-work">
			<div className="sec-head">
				<h2><span className="num">{navNumber('work')}</span> {title}<span className="ac">.</span></h2>
				<span className="note">{t.sections.projects.note(count)}</span>
			</div>
			<AreaFilter areas={chips} total={count} selected={selectedArea} onSelect={setSelectedArea} />
			<div className="work-grid">
				{items.map((w, idx) => (
					<Link
						key={w.i}
						href={href(`/projects/${w.slug}`)}
						className={'work-card' + (idx === 0 ? ' feat' : '')}
					>
						{w.image ? (
							<img
								className="work-shot"
								src={w.image}
								alt={w.t}
								style={{ viewTransitionName: `project-image-${w.slug}` }}
							/>
						) : (
							<span className="work-shot-placeholder" aria-hidden="true" />
						)}
						<div className="wc-body">
							<span className="idx">{w.i}{w.k && ` · ${w.k}`}</span>
							<h3>{w.t}</h3>
							<p className="desc">{w.d}</p>
							{w.links.length > 0 && (
								<div className="wc-links">
									{w.links.map((l) => {
										const Icon = LINK_ICONS[l.type] || ILinkIcon;
										return (
											<button
												key={l.url}
												className="wc-link"
												onClick={(e) => {
													e.preventDefault();
													e.stopPropagation();
													window.open(l.url, l.isExternal ? '_blank' : '_self');
												}}
											>
												<Icon /> {l.label}
											</button>
										);
									})}
								</div>
							)}
							<div className="wc-foot">
								<span className="tags">{w.tags}</span>
								<span className="go"><IArrowUR /></span>
							</div>
						</div>
					</Link>
				))}
			</div>
		</section>
	);
}
