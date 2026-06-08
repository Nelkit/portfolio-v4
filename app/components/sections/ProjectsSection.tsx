import Link from 'next/link';
import { type Project, type ProjectLink } from '@/app/data/content';
import { IArrowUR, IGithub, ILinkedin, IMail } from '@/app/components/icons';

const ILinkIcon = () => (
	<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="13" height="13">
		<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
		<path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
	</svg>
);

const LINK_ICONS: Record<string, () => JSX.Element> = {
	github:   IGithub,
	linkedin: ILinkedin,
	email:    IMail,
	link:     ILinkIcon,
};

type ProjectsSectionProps = {
	title: string;
	projects: Project[];
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

const FALLBACK_ITEMS: CardItem[] = [
	{ slug: 'atlas-commerce',    i: '01', k: 'iOS · 2024',            t: 'Atlas Commerce',    d: 'iOS shopping app with real-time inventory, native checkout, and a personalised recommendations rail powered by a server-side ML ranker.', tags: 'Swift · SwiftUI · Postgres · Recsys', image: '', links: [] },
	{ slug: 'pulse-recommender', i: '02', k: 'Microservice · 2024',   t: 'Pulse Recommender', d: 'Low-latency recommender microservice serving 3M+ daily ranked items, with feature-flag rollout and online A/B evaluation.',           tags: 'Python · FastAPI · Redis · TensorFlow', image: '', links: [] },
	{ slug: 'terranova-gis',     i: '03', k: 'Cross-platform · 2023', t: 'Terranova GIS',     d: 'Offline-first field-survey app for remote utility crews. GPS capture, photo evidence, conflict-free sync over patchy links.',          tags: 'Flutter · PostGIS · Mapbox', image: '', links: [] },
];

export function ProjectsSection({ title, projects }: ProjectsSectionProps) {
	const items: CardItem[] = projects.length > 0
		? projects.map((p, idx) => ({
			slug: p.slug,
			i: String(idx + 1).padStart(2, '0'),
			k: p.expertise_area || '',
			t: p.title,
			d: p.summary || p.description,
			tags: p.tech.join(' · '),
			image: p.image,
			links: p.links || [],
		}))
		: FALLBACK_ITEMS;

	const count = items.length;

	return (
		<section id="work" className="section section-work">
			<div className="sec-head">
				<h2><span className="num">02</span> {title}<span className="ac">.</span></h2>
				<span className="note">{count} projects · ordered by recency</span>
			</div>
			<div className="work-grid">
				{items.map((w, idx) => (
					<Link
						key={w.i}
						href={`/projects/${w.slug}`}
						className={'work-card' + (idx === 0 ? ' feat' : '')}
					>
						{w.image ? (
							<img className="work-shot" src={w.image} alt={w.t} />
						) : (
							<span className="work-shot-placeholder" aria-hidden="true" />
						)}
						<div className="wc-body">
							<span className="idx">{w.i} · {w.k}</span>
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
