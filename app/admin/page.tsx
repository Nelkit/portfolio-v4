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
					<button type="submit" className="text-sm text-ui-dim hover:text-ui-text">
						Log out
					</button>
				</form>
			</header>

			<ul className="flex flex-col gap-2">
				<li>
					<Link
						href="/admin/blog"
						className="block rounded border border-ui-border px-4 py-3 hover:border-ui-accent"
					>
						Blog <span className="text-ui-faint">— write, edit and delete posts</span>
					</Link>
				</li>
				<li>
					<Link
						href="/admin/tags"
						className="block rounded border border-ui-border px-4 py-3 hover:border-ui-accent"
					>
						Blog tags <span className="text-ui-faint">— filter the blog and relate posts</span>
					</Link>
				</li>
				<li>
					<Link
						href="/admin/profile"
						className="block rounded border border-ui-border px-4 py-3 hover:border-ui-accent"
					>
						Profile <span className="text-ui-faint">— name, avatar, role, intro, CV, links, contact</span>
					</Link>
				</li>
				<li>
					<Link
						href="/admin/projects"
						className="block rounded border border-ui-border px-4 py-3 hover:border-ui-accent"
					>
						Projects <span className="text-ui-faint">— create, edit, delete and reorder</span>
					</Link>
				</li>
				<li>
					<Link
						href="/admin/areas"
						className="block rounded border border-ui-border px-4 py-3 hover:border-ui-accent"
					>
						Expertise areas <span className="text-ui-faint">— group and filter projects</span>
					</Link>
				</li>
				<li>
					<Link
						href="/admin/skills"
						className="block rounded border border-ui-border px-4 py-3 hover:border-ui-accent"
					>
						Tech stack <span className="text-ui-faint">— skill categories and skills</span>
					</Link>
				</li>
				<li>
					<Link
						href="/admin/career"
						className="block rounded border border-ui-border px-4 py-3 hover:border-ui-accent"
					>
						Career <span className="text-ui-faint">— timeline entries</span>
					</Link>
				</li>
				<li>
					<Link
						href="/admin/education"
						className="block rounded border border-ui-border px-4 py-3 hover:border-ui-accent"
					>
						Education <span className="text-ui-faint">— degrees and courses</span>
					</Link>
				</li>
				<li>
					<Link
						href="/admin/hero"
						className="block rounded border border-ui-border px-4 py-3 hover:border-ui-accent"
					>
						Hero <span className="text-ui-faint">— headline</span>
					</Link>
				</li>
			</ul>
		</main>
	);
}
