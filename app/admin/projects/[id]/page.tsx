import Link from 'next/link';
import { notFound } from 'next/navigation';
import { requireAdmin } from '@/app/lib/auth/admin';
import { projectRepository } from '@/app/lib/content/projects/project-service';
import { LOCALES, type Locale } from '@/app/lib/i18n/locales';
import type { ProjectInput, ProjectTranslation } from '@/app/lib/content/projects/project';
import { ProjectForm } from '../ProjectForm';
import { ProjectMedia } from '../ProjectMedia';
import { publicUrlFor } from '@/app/lib/storage/storage';
import { loadAreaViews } from '@/app/lib/content/areas/area-service';
import { skillCategoryRepository } from '@/app/lib/content/skills/skill-service';

export const dynamic = 'force-dynamic';

export default async function EditProjectPage({ params }: { params: Promise<{ id: string }> }) {
	await requireAdmin();
	const id = Number((await params).id);
	if (!Number.isInteger(id) || id <= 0) notFound();

	// Uncached read: the editor always shows what is in the database.
	const [project, areas, catalog] = await Promise.all([
		projectRepository().getProject(id),
		loadAreaViews('en'),
		skillCategoryRepository().listSkills(),
	]);
	if (!project) notFound();

	const blank: ProjectTranslation = { title: '', summary: '', description: '' };
	const initial: ProjectInput = {
		slug: project.slug,
		company: project.company,
		areaId: project.areaId,
		skills: project.skills,
		links: project.links,
		translations: Object.fromEntries(
			LOCALES.map((locale) => [locale, project.translations[locale] ?? blank]),
		) as Record<Locale, ProjectTranslation>,
	};

	return (
		<main className="flex flex-col gap-6">
			<Link href="/admin/projects" className="text-sm text-zinc-400 hover:text-zinc-100">← Projects</Link>
			<header className="flex items-center justify-between">
				<h1 className="text-xl font-semibold">Edit project</h1>
				<a href={`/en/projects/${project.slug}`} target="_blank" rel="noreferrer" className="text-sm text-zinc-400 hover:text-zinc-100">
					View on site ↗
				</a>
			</header>
			<ProjectMedia
				// remount with fresh order after each media change
				key={project.screenshots.map((s) => s.id).join(',') + (project.imageKey ?? '')}
				projectId={project.id}
				imageUrl={project.imageKey ? publicUrlFor(project.imageKey) : null}
				screenshots={project.screenshots.map((s) => ({ id: s.id, url: publicUrlFor(s.key) }))}
			/>
			<ProjectForm id={project.id} initial={initial} areas={areas} skillCatalog={catalog.map((s) => s.name)} />
		</main>
	);
}
