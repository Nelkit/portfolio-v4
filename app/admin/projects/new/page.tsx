import Link from 'next/link';
import { requireAdmin } from '@/app/lib/auth/admin';
import { ProjectForm } from '../ProjectForm';
import type { ProjectInput } from '@/app/lib/content/projects/project';

const EMPTY: ProjectInput = {
	slug: '',
	company: '',
	translations: {
		en: { title: '', summary: '', description: '' },
		es: { title: '', summary: '', description: '' },
	},
	links: [],
};

export default async function NewProjectPage() {
	await requireAdmin();
	return (
		<main className="flex flex-col gap-6">
			<Link href="/admin/projects" className="text-sm text-zinc-400 hover:text-zinc-100">← Projects</Link>
			<h1 className="text-xl font-semibold">New project</h1>
			<ProjectForm initial={EMPTY} />
		</main>
	);
}
