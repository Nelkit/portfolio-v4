import Link from 'next/link';
import { type Project } from '@/app/data/content';

const IArrowUR = () => (
	<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
		<path d="M7 17 17 7M9 7h8v8"/>
	</svg>
);

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
};

const FALLBACK_ITEMS: CardItem[] = [
	{ slug: 'atlas-commerce',    i: '01', k: 'iOS · 2024',            t: 'Atlas Commerce',    d: 'iOS shopping app with real-time inventory, native checkout, and a personalised recommendations rail powered by a server-side ML ranker.', tags: 'Swift · SwiftUI · Postgres · Recsys', image: '' },
	{ slug: 'pulse-recommender', i: '02', k: 'Microservice · 2024',   t: 'Pulse Recommender', d: 'Low-latency recommender microservice serving 3M+ daily ranked items, with feature-flag rollout and online A/B evaluation.',           tags: 'Python · FastAPI · Redis · TensorFlow', image: '' },
	{ slug: 'terranova-gis',     i: '03', k: 'Cross-platform · 2023', t: 'Terranova GIS',     d: 'Offline-first field-survey app for remote utility crews. GPS capture, photo evidence, conflict-free sync over patchy links.',          tags: 'Flutter · PostGIS · Mapbox', image: '' },
];

export function ProjectsSection({ title, projects }: ProjectsSectionProps) {
	const items: CardItem[] = projects.length > 0
		? projects.map((p, idx) => ({
			slug: p.slug,
			i: String(idx + 1).padStart(2, '0'),
			k: p.expertise_area || '',
			t: p.title,
			d: p.description,
			tags: p.tech.join(' · '),
			image: p.image,
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
