import Link from 'next/link';
import { getStrapiData } from '@/app/lib/strapi';
import qs from 'qs';
import { notFound } from 'next/navigation';

export const revalidate = 60;

const IArrowLeft = () => (
	<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="16" height="16">
		<path d="M19 12H5m0 0 6 6m-6-6 6-6"/>
	</svg>
);

const IArrowUR = () => (
	<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="14" height="14">
		<path d="M7 17 17 7M9 7h8v8"/>
	</svg>
);

async function fetchProject(slug: string) {
	const query = qs.stringify({
		filters: { documentId: { $eq: slug } },
		populate: {
			image: { fields: ['url', 'alternativeText'] },
			skills: { fields: ['title'] },
			expertiseArea: { fields: ['code', 'title'] },
		},
	}, { encodeValuesOnly: true });

	const data = await getStrapiData(`/api/projects?${query}`);
	return data?.data?.[0] ?? null;
}

async function fetchOtherProjects(currentSlug: string) {
	const query = qs.stringify({
		filters: { documentId: { $ne: currentSlug } },
		populate: {
			image: { fields: ['url', 'alternativeText'] },
			expertiseArea: { fields: ['code', 'title'] },
		},
		pagination: { pageSize: 20 },
	}, { encodeValuesOnly: true });

	const data = await getStrapiData(`/api/projects?${query}`);
	const all: any[] = data?.data ?? [];

	// Fisher-Yates shuffle, take 3
	for (let i = all.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[all[i], all[j]] = [all[j], all[i]];
	}
	return all.slice(0, 3);
}

export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
	const { slug } = await params;
	const strapiUrl = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';

	const [project, others] = await Promise.all([
		fetchProject(slug),
		fetchOtherProjects(slug),
	]);

	if (!project) notFound();

	const image = project.image?.url ? `${strapiUrl}${project.image.url}` : null;
	const tech: string[] = project.skills?.map((s: any) => s.title) || [];
	const area: string = project.expertiseArea?.title || project.expertiseArea?.code || '';

	return (
		<div className="proj-detail-root">
			<div className="bg-fx" aria-hidden="true">
				<div className="glow" />
				<div className="glow-2" />
				<div className="grid" />
				<div className="grain" />
			</div>

			<div className="proj-detail-wrap">
				<Link href="/#work" className="proj-back">
					<IArrowLeft /> Back to projects
				</Link>

				<div className="proj-layout">
					{/* Main article */}
					<article className="proj-detail">
						<header className="proj-header">
							{area && <div className="proj-meta"><span className="proj-area">{area}</span></div>}
							<h1 className="proj-title">{project.title}</h1>
							{project.description && (
								<p className="proj-desc">{project.description}</p>
							)}
						</header>

						{image && (
							<div className="proj-image-wrap">
								<img src={image} alt={project.image?.alternativeText || project.title} className="proj-image" />
							</div>
						)}

						{tech.length > 0 && (
							<div className="proj-section">
								<h2 className="proj-section-title">Tech stack</h2>
								<div className="proj-tags">
									{tech.map((t: string) => (
										<span key={t} className="proj-tag">{t}</span>
									))}
								</div>
							</div>
						)}
					</article>

					{/* Aside — other projects */}
					{others.length > 0 && (
						<aside className="proj-aside">
							<p className="proj-aside-label">More projects</p>
							<div className="proj-aside-list">
								{others.map((p: any) => {
									const thumb = p.image?.url ? `${strapiUrl}${p.image.url}` : null;
									const areaLabel = p.expertiseArea?.title || p.expertiseArea?.code || '';
									return (
										<Link
											key={p.documentId}
											href={`/projects/${p.documentId}`}
											className="proj-aside-card"
										>
											{thumb ? (
												<img src={thumb} alt={p.title} className="proj-aside-thumb" />
											) : (
												<span className="proj-aside-thumb proj-aside-thumb-empty" />
											)}
											<div className="proj-aside-body">
												{areaLabel && <span className="proj-aside-area">{areaLabel}</span>}
												<span className="proj-aside-title">{p.title}</span>
											</div>
											<span className="proj-aside-go"><IArrowUR /></span>
										</Link>
									);
								})}
							</div>
						</aside>
					)}
				</div>
			</div>
		</div>
	);
}
