import Link from 'next/link';
import { requireAdmin } from '@/app/lib/auth/admin';
import { ProjectForm } from '../ProjectForm';
import { EMPTY_TRANSLATION, type ProjectFormValues } from '@/app/lib/content/projects/project';
import { loadAreaViews } from '@/app/lib/content/areas/area-service';
import { skillCategoryRepository } from '@/app/lib/content/skills/skill-service';

const EMPTY: ProjectFormValues = {
	slug: '',
	organisation: '',
	year: null,
	areaId: null,
	featured: false,
	featuredOrder: 0,
	screenshotsPosition: 'bottom',
	skills: [],
	translations: { en: EMPTY_TRANSLATION, es: EMPTY_TRANSLATION },
	links: [],
};

export const dynamic = 'force-dynamic';

export default async function NewProjectPage() {
	await requireAdmin();
	const [areas, catalog] = await Promise.all([loadAreaViews('en'), skillCategoryRepository().listSkills()]);
	return (
		<main className="flex flex-col gap-6">
			<Link href="/admin/projects" className="text-sm text-ui-dim hover:text-ui-text">← Projects</Link>
			<h1 className="text-xl font-semibold">New project</h1>
			<p className="text-sm text-ui-faint">Images (main image and screenshots) can be added after the project is created.</p>
			<ProjectForm initial={EMPTY} areas={areas} skillCatalog={catalog.map((s) => s.name)} />
		</main>
	);
}
