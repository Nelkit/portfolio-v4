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

const FALLBACK_PROJECTS = [
	{ i: '01', k: 'iOS · 2024',            t: 'Atlas Commerce',    d: 'iOS shopping app with real-time inventory, native checkout, and a personalised recommendations rail powered by a server-side ML ranker.', tags: 'Swift · SwiftUI · Postgres · Recsys', image: '' },
	{ i: '02', k: 'Microservice · 2024',   t: 'Pulse Recommender', d: 'Low-latency recommender microservice serving 3M+ daily ranked items, with feature-flag rollout and online A/B evaluation.',           tags: 'Python · FastAPI · Redis · TensorFlow', image: '' },
	{ i: '03', k: 'Cross-platform · 2023', t: 'Terranova GIS',     d: 'Offline-first field-survey app for remote utility crews. GPS capture, photo evidence, conflict-free sync over patchy links.',          tags: 'Flutter · PostGIS · Mapbox', image: '' },
	{ i: '04', k: 'Web · 2022',            t: 'Stockpile',         d: 'Real-time inventory dashboard for four warehouses. Replaced a daily spreadsheet ritual with sub-second updates.',                     tags: 'React · Django · WebSockets', image: '' },
	{ i: '05', k: 'Cross-platform · 2022', t: 'Mira Wellness',     d: 'Cross-platform habit and biometric tracker. Watch-paired workouts, HealthKit / Health Connect bridging, encrypted sync.',             tags: 'React Native · Kotlin · HealthKit', image: '' },
	{ i: '06', k: 'On-device ML · 2025',   t: 'SightlineQA',       d: 'On-device vision quality inspector for a manufacturing line. CoreML model with a custom training pipeline; runs offline.',             tags: 'CoreML · Python · Computer Vision', image: '' },
	{ i: '07', k: 'LLM · 2025',            t: 'Echo Copilot',      d: 'Customer-support copilot with tool use, retrieval and grounded answers. Cut first-response time by 38% in pilot.',                    tags: 'LangChain · Postgres · RAG', image: '' },
];

export function ProjectsSection({ title, projects, onNav }: ProjectsSectionProps) {
	const items = projects.length > 0
		? projects.map((p, idx) => ({
			i: String(idx + 1).padStart(2, '0'),
			k: p.expertise_area || '',
			t: p.title,
			d: p.description,
			tags: p.tech.join(' · '),
			image: p.image,
		}))
		: FALLBACK_PROJECTS;

	const count = items.length;

	return (
		<section id="work" className="section section-work">
			<div className="sec-head">
				<h2><span className="num">02</span> {title}<span className="ac">.</span></h2>
				<span className="note">{count} projects · ordered by recency</span>
			</div>
			<div className="work-grid">
				{items.map((w, idx) => (
					<article
						key={w.i}
						className={'work-card' + (idx === 0 ? ' feat' : '')}
						onClick={() => onNav('work')}
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
					</article>
				))}
			</div>
		</section>
	);
}
