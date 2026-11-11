import type { Metadata } from 'next';
import Link from 'next/link';
import { IArrowUR } from '@/app/components/icons';
import { resolveLocale } from '@/app/lib/i18n/server';
import { getPublishedProjects } from '@/app/lib/content/projects/project-service';

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
	const projects = await getPublishedProjects(locale);

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
					<div className="proj-list-grid">
						{projects.map((p, idx) => {
							const featured = idx === 0;
							return (
								<Link key={p.slug} href={href(`/projects/${p.slug}`)}
									className={'proj-list-card' + (featured ? ' proj-list-card-feat' : '')}>
									{/* Images arrive with story #5; until then the numbered placeholder. */}
									<div className="proj-list-thumb proj-list-thumb-empty">
										<span>{String(idx + 1).padStart(2, '0')}</span>
									</div>
									<div className="proj-list-body">
										<div className="proj-list-meta">
											{p.company && <span className="proj-area">{p.company}</span>}
										</div>
										<h2 className={'proj-list-title' + (featured ? ' proj-list-title-feat' : '')}>{p.title}</h2>
										{p.summary && <p className="proj-list-summary">{p.summary}</p>}
									</div>
									<span className="proj-list-go"><IArrowUR /></span>
								</Link>
							);
						})}
					</div>
				)}
			</div>
		</div>
	);
}
