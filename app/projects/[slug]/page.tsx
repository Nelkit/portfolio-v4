import type { Metadata } from 'next';
import Link from 'next/link';
import { getStrapiData } from '@/app/lib/strapi';
import { mediaUrl } from '@/app/lib/constant';
import qs from 'qs';
import { notFound } from 'next/navigation';
import { IArrowLeft, IArrowUR, IGithub, ILinkedin, IMail } from '@/app/components/icons';
import { ScreenshotGallery } from '@/app/components/ScreenshotGallery';
import { TrackProjectView } from '@/app/components/TrackProjectView';
import { PostBody } from '@/app/components/PostBody';
import type { BlocksContent } from '@strapi/blocks-react-renderer';

const ILink = () => (
	<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="14" height="14">
		<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
		<path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
	</svg>
);

const LINK_ICONS: Record<string, () => React.ReactElement> = {
	github:   IGithub,
	linkedin: ILinkedin,
	email:    IMail,
	link:     ILink,
};

export const revalidate = 86400;

// Pre-generate every project page at build time so clicks are instant.
// New projects added later are still rendered on-demand and then cached (ISR).
export async function generateStaticParams() {
	const query = qs.stringify({
		fields: ['documentId'],
		pagination: { pageSize: 100 },
	}, { encodeValuesOnly: true });
	const data = await getStrapiData(`/api/projects?${query}`);
	return (data?.data ?? []).map((p: { documentId: string }) => ({ slug: p.documentId }));
}

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

export async function generateMetadata(
	{ params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
	const { slug } = await params;
	const project = await fetchProject(slug);
	if (!project) return {};

	const url = `https://nelkit.dev/projects/${slug}`;
	const ogImage = mediaUrl(project.image?.url) || 'https://nelkit.dev/img/og-image.jpg';
	// description is now rich-text (blocks); only use it for meta if it's still a
	// plain string (legacy). Otherwise fall back to summary to avoid "[object Object]".
	const description = project.summary
		|| (typeof project.description === 'string' ? project.description : '')
		|| '';

	return {
		title: project.title,
		description,
		alternates: { canonical: url },
		openGraph: {
			type: 'website',
			url,
			title: `${project.title} · Nelkit Chavez`,
			description,
			images: [{ url: ogImage, width: 1200, height: 630, alt: project.title }],
		},
		twitter: {
			card: 'summary_large_image',
			title: `${project.title} · Nelkit Chavez`,
			description,
			images: [ogImage],
		},
	};
}

export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
	const { slug } = await params;
	const [project, others] = await Promise.all([
		fetchProject(slug),
		fetchOtherProjects(slug),
	]);

	if (!project) notFound();

	const image = mediaUrl(project.image?.url) || null;
	// Strapi rich-text comes as an array of blocks; anything else (legacy string)
	// is handled by the fallback in the JSX below.
	const descBlocks: BlocksContent | null = Array.isArray(project.description)
		? (project.description as BlocksContent)
		: null;
	const tech: string[] = project.skills?.map((s: any) => s.title) || [];
	const area: string = project.expertiseArea?.title || project.expertiseArea?.code || '';
	const screenshots: { url: string; alt: string }[] = project.screenshots
		? (Array.isArray(project.screenshots)
			? project.screenshots.map((s: any) => ({ url: mediaUrl(s.url), alt: s.alternativeText || project.title }))
			: [{ url: mediaUrl(project.screenshots.url), alt: project.title }])
		: [];
	const links: { label: string; url: string; type: string; isExternal: boolean }[] = project.links?.map((l: any) => ({
		label: l.label || l.href || '',
		url: l.href || l.url || '',
		type: l.type || 'link',
		isExternal: l.isExternal ?? true,
	})) || [];

	return (
		<div className="proj-detail-root">
			<TrackProjectView slug={slug} title={project.title} />
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
								<img
									src={image}
									alt={project.image?.alternativeText || project.title}
									className="proj-image"
									style={{ viewTransitionName: `project-image-${slug}` }}
								/>
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

						{/* description is now a Strapi rich-text (blocks) field. Render it
						    through PostBody; fall back to a plain <p> for legacy string
						    values so un-migrated projects still display. */}
						{descBlocks ? (
							<div className="proj-desc proj-desc-body">
								<PostBody content={descBlocks} highlighted={{}} />
							</div>
						) : typeof project.description === 'string' && project.description.trim() ? (
							<p className="proj-desc proj-desc-body">{project.description}</p>
						) : null}

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
								<ScreenshotGallery screenshots={screenshots} />
							</div>
						)}
					</article>

					{/* Aside — other projects */}
					{others.length > 0 && (
						<aside className="proj-aside">
							<p className="proj-aside-label">More projects</p>
							<div className="proj-aside-list">
								{others.map((p: any) => {
									const thumb = mediaUrl(p.image?.url) || null;
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
