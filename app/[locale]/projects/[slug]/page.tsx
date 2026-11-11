import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { IArrowLeft, IArrowUR, IGithub, ILinkedin, IMail } from '@/app/components/icons';
import { TrackProjectView } from '@/app/components/TrackProjectView';
import { Markdown } from '@/app/components/Markdown';
import { ScreenshotGallery } from '@/app/components/ScreenshotGallery';
import { resolveLocale } from '@/app/lib/i18n/server';
import { LOCALES } from '@/app/lib/i18n/locales';
import {
	getPublishedProject,
	getPublishedProjects,
	projectRepository,
} from '@/app/lib/content/projects/project-service';
import type { ProjectView } from '@/app/lib/content/projects/project';

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

export const revalidate = 604800;

type Params = { params: Promise<{ locale: string; slug: string }> };

// Pre-generate every project page in every language so clicks are instant.
// Projects added later render on demand and are then cached.
export async function generateStaticParams() {
	const projects = await projectRepository().listProjects();
	return LOCALES.flatMap((locale) => projects.map((p) => ({ locale, slug: p.slug })));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
	const { locale } = await resolveLocale(params);
	const { slug } = await params;
	const project = await getPublishedProject(locale, slug);
	if (!project) return {};

	const url = `https://nelkit.dev/${locale}/projects/${slug}`;
	// Relative URLs (local uploads) are resolved against metadataBase.
	const ogImage = project.imageUrl ?? 'https://nelkit.dev/img/og-image.jpg';

	return {
		title: project.title,
		description: project.summary,
		alternates: { canonical: url },
		openGraph: {
			type: 'website',
			url,
			title: `${project.title} · Nelkit Chavez`,
			description: project.summary,
			images: [{ url: ogImage, width: 1200, height: 630, alt: project.title }],
		},
		twitter: {
			card: 'summary_large_image',
			title: `${project.title} · Nelkit Chavez`,
			description: project.summary,
			images: [ogImage],
		},
	};
}

/** Up to 3 other projects, shuffled (Fisher-Yates). */
function pickOthers(all: ProjectView[], currentSlug: string): ProjectView[] {
	const others = all.filter((p) => p.slug !== currentSlug);
	for (let i = others.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[others[i], others[j]] = [others[j], others[i]];
	}
	return others.slice(0, 3);
}

export default async function ProjectPage({ params }: Params) {
	const { locale, t, href } = await resolveLocale(params);
	const copy = t.projects;
	const { slug } = await params;
	const [project, all] = await Promise.all([
		getPublishedProject(locale, slug),
		getPublishedProjects(locale),
	]);

	if (!project) notFound();
	const others = pickOthers(all, slug);

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
				<Link href={href('/#work')} className="proj-back">
					<IArrowLeft /> {copy.backToProjects}
				</Link>

				<div className="proj-layout">
					<article className="proj-detail">
						<header className="proj-header">
							<div className="proj-meta">
								{project.area && <span className="proj-area">{project.area.name}</span>}
								{project.company && <span className="proj-company">{project.company}</span>}
							</div>
							<h1 className="proj-title">{project.title}</h1>
							{project.summary && <p className="proj-summary">{project.summary}</p>}
						</header>

						{project.imageUrl && (
							<div className="proj-image-wrap">
								{/* eslint-disable-next-line @next/next/no-img-element */}
								<img
									src={project.imageUrl}
									alt={project.title}
									className="proj-image"
									style={{ viewTransitionName: `project-image-${slug}` }}
								/>
							</div>
						)}

						{project.links.length > 0 && (
							<div className="proj-links-inline">
								{project.links.map((l) => {
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

						{project.description.trim() && (
							<div className="proj-desc proj-desc-body">
								<Markdown>{project.description}</Markdown>
							</div>
						)}

						{project.screenshots.length > 0 && (
							<div className="proj-section">
								<h2 className="proj-section-title">{copy.screenshots}</h2>
								<ScreenshotGallery
									screenshots={project.screenshots.map((url, i) => ({ url, alt: `${project.title} — ${i + 1}` }))}
								/>
							</div>
						)}
					</article>

					{others.length > 0 && (
						<aside className="proj-aside">
							<p className="proj-aside-label">{copy.moreProjects}</p>
							<div className="proj-aside-list">
								{others.map((p) => (
									<Link key={p.slug} href={href(`/projects/${p.slug}`)} className="proj-aside-card">
										{p.imageUrl ? (
											// eslint-disable-next-line @next/next/no-img-element
											<img src={p.imageUrl} alt={p.title} className="proj-aside-thumb" />
										) : (
											<span className="proj-aside-thumb proj-aside-thumb-empty" />
										)}
										<div className="proj-aside-body">
											{(p.area?.name || p.company) && <span className="proj-aside-area">{p.area?.name ?? p.company}</span>}
											<span className="proj-aside-title">{p.title}</span>
										</div>
										<span className="proj-aside-go"><IArrowUR /></span>
									</Link>
								))}
							</div>
						</aside>
					)}
				</div>
			</div>
		</div>
	);
}
