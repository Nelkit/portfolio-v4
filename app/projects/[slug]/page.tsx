import Link from 'next/link';
import { getStrapiData } from '@/app/lib/strapi';
import qs from 'qs';
import { notFound } from 'next/navigation';
import { IArrowLeft, IArrowUR, IGithub, ILinkedin, IMail } from '@/app/components/icons';

const ILink = () => (
	<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="14" height="14">
		<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
		<path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
	</svg>
);

const LINK_ICONS: Record<string, () => JSX.Element> = {
	github:   IGithub,
	linkedin: ILinkedin,
	email:    IMail,
	link:     ILink,
};

export const revalidate = 60;

async function fetchProject(slug: string) {
	const query = qs.stringify({
		filters: { documentId: { $eq: slug } },
		populate: {
			image: { fields: ['url', 'alternativeText'] },
			skills: { fields: ['title'] },
			expertiseArea: { fields: ['code', 'title'] },
			screenshots: { fields: ['url', 'alternativeText', 'width', 'height'] },
			links: '*',
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
	const screenshots: { url: string; alt: string }[] = project.screenshots
		? (Array.isArray(project.screenshots)
			? project.screenshots.map((s: any) => ({ url: `${strapiUrl}${s.url}`, alt: s.alternativeText || project.title }))
			: [{ url: `${strapiUrl}${project.screenshots.url}`, alt: project.title }])
		: [];
	const links: { label: string; url: string; type: string; isExternal: boolean }[] = project.links?.map((l: any) => ({
		label: l.label || l.href || '',
		url: l.href || l.url || '',
		type: l.type || 'link',
		isExternal: l.isExternal ?? true,
	})) || [];

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
							<div className="proj-meta">
								{area && <span className="proj-area">{area}</span>}
								{project.company && <span className="proj-company">{project.company}</span>}
							</div>
							<h1 className="proj-title">{project.title}</h1>
							{project.summary && (
								<p className="proj-summary">{project.summary}</p>
							)}
						</header>

						{image && (
							<div className="proj-image-wrap">
								<img src={image} alt={project.image?.alternativeText || project.title} className="proj-image" />
							</div>
						)}

						{links.length > 0 && (
							<div className="proj-links-inline">
								{links.map((l) => {
									const Icon = LINK_ICONS[l.type] || ILink;
									return (
										<a
											key={l.url}
											href={l.url}
											target={l.isExternal ? '_blank' : undefined}
											rel={l.isExternal ? 'noopener noreferrer' : undefined}
											className="proj-link"
										>
											<Icon /> {l.label}
										</a>
									);
								})}
							</div>
						)}

						{project.description && (
							<p className="proj-desc proj-desc-body">{project.description}</p>
						)}

						{tech.length > 0 && (
							<div className="proj-section proj-section-stack">
								<h2 className="proj-section-title">Tech stack</h2>
								<div className="proj-tags">
									{tech.map((t: string) => (
										<span key={t} className="proj-tag">{t}</span>
									))}
								</div>
							</div>
						)}

						{screenshots.length > 0 && (
							<div className="proj-section">
								<h2 className="proj-section-title">Screenshots</h2>
								<div className="proj-screenshots">
									{screenshots.map((s) => (
										<div key={s.url} className="proj-screenshot-wrap">
											<img src={s.url} alt={s.alt} className="proj-screenshot" />
										</div>
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
