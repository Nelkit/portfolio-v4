import Link from 'next/link';
import { requireAdmin } from '@/app/lib/auth/admin';
import { areaRepository } from '@/app/lib/content/areas/area-service';
import { projectRepository } from '@/app/lib/content/projects/project-service';
import { LOCALES, type Locale } from '@/app/lib/i18n/locales';
import { AreasEditor, type AreaRow } from './AreasEditor';

export const dynamic = 'force-dynamic';

export default async function AreasAdminPage() {
	await requireAdmin();
	const [areas, projects] = await Promise.all([areaRepository().listAreas(), projectRepository().listProjects()]);

	const rows: AreaRow[] = areas.map((area) => ({
		id: area.id,
		names: Object.fromEntries(LOCALES.map((l) => [l, area.translations[l]?.name ?? ''])) as Record<Locale, string>,
		projects: projects.filter((p) => p.areaId === area.id).length,
	}));

	return (
		<main className="flex flex-col gap-6">
			<Link href="/admin" className="text-sm text-zinc-400 hover:text-zinc-100">← Dashboard</Link>
			<h1 className="text-xl font-semibold">Expertise areas</h1>
			<p className="text-sm text-zinc-500">Assign an area to each project from the project form. Visitors filter projects by area.</p>
			{/* remount with fresh data after any server change */}
			<AreasEditor key={rows.map((r) => `${r.id}:${r.names.en}:${r.projects}`).join('|')} initial={rows} />
		</main>
	);
}
