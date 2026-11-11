import Link from 'next/link';
import { requireAdmin } from '@/app/lib/auth/admin';
import { logout } from '@/app/admin/actions';

export default async function AdminHome() {
	await requireAdmin();

	return (
		<main className="flex flex-col gap-8">
			<header className="flex items-center justify-between">
				<h1 className="text-xl font-semibold">Dashboard</h1>
				<form action={logout}>
					<button type="submit" className="text-sm text-zinc-400 hover:text-zinc-100">
						Log out
					</button>
				</form>
			</header>

			<ul className="flex flex-col gap-2">
				<li>
					<Link
						href="/admin/profile"
						className="block rounded border border-zinc-800 px-4 py-3 hover:border-zinc-500"
					>
						Profile <span className="text-zinc-500">— name, avatar, role, intro, CV, links, contact</span>
					</Link>
				</li>
				<li>
					<Link
						href="/admin/projects"
						className="block rounded border border-zinc-800 px-4 py-3 hover:border-zinc-500"
					>
						Projects <span className="text-zinc-500">— create, edit, delete and reorder</span>
					</Link>
				</li>
				<li>
					<Link
						href="/admin/areas"
						className="block rounded border border-zinc-800 px-4 py-3 hover:border-zinc-500"
					>
						Expertise areas <span className="text-zinc-500">— group and filter projects</span>
					</Link>
				</li>
				<li>
					<Link
						href="/admin/skills"
						className="block rounded border border-zinc-800 px-4 py-3 hover:border-zinc-500"
					>
						Tech stack <span className="text-zinc-500">— skill categories and skills</span>
					</Link>
				</li>
				<li>
					<Link
						href="/admin/career"
						className="block rounded border border-zinc-800 px-4 py-3 hover:border-zinc-500"
					>
						Career <span className="text-zinc-500">— timeline entries</span>
					</Link>
				</li>
				<li>
					<Link
						href="/admin/hero"
						className="block rounded border border-zinc-800 px-4 py-3 hover:border-zinc-500"
					>
						Hero <span className="text-zinc-500">— headline</span>
					</Link>
				</li>
			</ul>
		</main>
	);
}
