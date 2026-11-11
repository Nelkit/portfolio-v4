import Link from 'next/link';
import { requireAdmin } from '@/app/lib/auth/admin';
import { projectRepository } from '@/app/lib/content/projects/project-service';
import { ProjectList } from './ProjectList';

export const dynamic = 'force-dynamic';

export default async function ProjectsAdminPage() {
	await requireAdmin();
	const projects = await projectRepository().listProjects();
	const rows = projects.map((p) => ({
		id: p.id,
		slug: p.slug,
		title: p.translations.en?.title ?? p.translations.es?.title ?? p.slug,
	}));

	return (
		<main className="flex flex-col gap-6">
			<Link href="/admin" className="text-sm text-zinc-400 hover:text-zinc-100">← Dashboard</Link>
			<header className="flex items-center justify-between">
				<h1 className="text-xl font-semibold">Projects</h1>
				<Link href="/admin/projects/new" className="rounded bg-zinc-100 px-3 py-2 text-sm font-semibold text-zinc-950">
					+ New project
				</Link>
			</header>
			{/* key: remount with fresh order after a server change */}
			<ProjectList key={rows.map((r) => r.id).join(',')} initial={rows} />
		</main>
	);
}
