'use client';

import Link from 'next/link';
import { navNumber } from '@/app/lib/nav';
import { IArrowUR, IGithub, ILinkedin, IMail } from '@/app/components/icons';
import { useI18n } from '@/app/lib/i18n/I18nProvider';
import type { ProjectView } from '@/app/lib/content/projects/project';
import { cardTags, homeCardLayout, type CardSize } from '@/app/lib/content/projects/project-display';

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

/** Card class per size: `feat` is the existing full-width (horizontal) card. */
const SIZE_CLASS: Record<CardSize, string> = { full: ' feat', half: ' half', third: '' };

type ProjectsSectionProps = {
	title: string;
	/** Featured projects, already in featuredOrder. */
	projects: ProjectView[];
	/** Number of published projects, for the link to /projects. */
	total: number;
};

/** Home "Selected work": a curated selection, no filters, and a link to every project. */
export function ProjectsSection({ title, projects, total }: ProjectsSectionProps) {
	const { t, href } = useI18n();
	if (projects.length === 0) return null;
	const sizes = homeCardLayout(projects.length);

	return (
		<section id="work" className="section section-work">
			<div className="sec-head">
				<h2><span className="num">{navNumber('work')}</span> {title}<span className="ac">.</span></h2>
				<span className="note">{t.sections.projects.note(projects.length)}</span>
			</div>
			<div className="work-grid">
				{projects.map((p, idx) => (
					<Link
						key={p.slug}
						href={href(`/projects/${p.slug}`)}
						className={'work-card' + SIZE_CLASS[sizes[idx]]}
					>
						{p.imageUrl ? (
							<img
								className="work-shot"
								src={p.imageUrl}
								alt={p.title}
								style={{ viewTransitionName: `project-image-${p.slug}` }}
							/>
						) : (
							<span className="work-shot-placeholder" aria-hidden="true" />
						)}
						<div className="wc-body">
							<span className="idx">{String(idx + 1).padStart(2, '0')}{p.area && ` · ${p.area.name}`}</span>
							<h3>{p.title}</h3>
							<p className="desc">{p.summary || p.description}</p>
							{p.keyResult && <p className="wc-key">{p.keyResult}</p>}
							{p.links.length > 0 && (
								<div className="wc-links">
									{p.links.map((l) => {
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
												<Icon /> {t.projects.linkLabels[l.label]}
											</button>
										);
									})}
								</div>
							)}
							<div className="wc-foot">
								<span className="tags">{cardTags(p.skills).join(' · ')}</span>
								<span className="go"><IArrowUR /></span>
							</div>
						</div>
					</Link>
				))}
			</div>
			<div className="write-foot">
				<Link href={href('/projects')} className="btn btn-outline write-all">
					{t.sections.projects.viewAll(total)}
				</Link>
			</div>
		</section>
	);
}
