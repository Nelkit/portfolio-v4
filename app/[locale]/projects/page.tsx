import type { Metadata } from 'next';
import Link from 'next/link';
import { resolveLocale } from '@/app/lib/i18n/server';
import { getPublishedProjects } from '@/app/lib/content/projects/project-service';
import { getPublishedAreas } from '@/app/lib/content/areas/area-service';
import { ProjectsListGrid } from './ProjectsListGrid';

export const revalidate = 604800;

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
	const { locale, t } = await resolveLocale(params);
	const url = `https://nelkit.dev/${locale}/projects`;
	return {
		title: t.meta.projectsTitle,
		description: t.meta.projectsDescription,
		alternates: { canonical: url },
		openGraph: {
			type: 'website',
			url,
			title: `${t.meta.projectsTitle} · Nelkit Chavez`,
			description: t.meta.projectsDescription,
			images: [{ url: 'https://nelkit.dev/img/og-image.jpg', width: 1200, height: 630 }],
		},
	};
}

export default async function ProjectsPage({ params }: Props) {
	const { locale, t, href } = await resolveLocale(params);
	const copy = t.projects;
	const [projects, areas] = await Promise.all([getPublishedProjects(locale), getPublishedAreas(locale)]);

	return (
		<div className="proj-detail-root">
			<div className="bg-fx" aria-hidden="true">
				<div className="glow" /><div className="glow-2" />
				<div className="grid" /><div className="grain" />
			</div>

			<div className="proj-list-wrap">
				<div className="blog-header">
					<Link href={href('/#work')} className="proj-back">← {t.common.back}</Link>
					<h1 className="blog-heading">{copy.heading}<span className="ac">.</span></h1>
					{projects.length > 0 && (
						<p className="blog-subheading">{copy.count(projects.length)}</p>
					)}
				</div>

				{projects.length === 0 ? (
					<p style={{ color: 'var(--text-faint)', fontStyle: 'italic' }}>{copy.empty}</p>
				) : (
					<ProjectsListGrid projects={projects} areas={areas} />
				)}
			</div>
		</div>
	);
}
