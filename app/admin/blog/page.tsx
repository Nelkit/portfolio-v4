import Link from 'next/link';
import { requireAdmin } from '@/app/lib/auth/admin';
import { postRepository } from '@/app/lib/content/posts/post-service';
import { LOCALES } from '@/app/lib/i18n/locales';
import { deletePost } from './actions';
import { DeletePostButton } from './DeletePostButton';

export const dynamic = 'force-dynamic';

export default async function BlogAdminPage() {
	await requireAdmin();
	const posts = await postRepository().listPosts();

	return (
		<main className="flex flex-col gap-6">
			<Link href="/admin" className="text-sm text-zinc-400 hover:text-zinc-100">← Dashboard</Link>
			<header className="flex items-center justify-between">
				<h1 className="text-xl font-semibold">Blog</h1>
				<Link href="/admin/blog/new" className="rounded bg-zinc-100 px-3 py-2 text-sm font-semibold text-zinc-950">
					+ New post
				</Link>
			</header>

			{posts.length === 0 ? (
				<p className="text-zinc-500">No posts yet.</p>
			) : (
				<ul className="flex flex-col divide-y divide-zinc-800 rounded border border-zinc-800">
					{posts.map((post) => {
						const title = post.translations.en?.title ?? post.translations.es?.title ?? post.slug;
						return (
							<li key={post.id} className="flex items-center gap-4 px-4 py-3">
								<span className="w-24 text-sm text-zinc-500">{post.publishedOn}</span>
								<span className={`w-20 rounded px-1.5 py-0.5 text-center text-xs ${post.status === 'published' ? 'bg-emerald-900 text-emerald-200' : 'bg-zinc-800 text-zinc-400'}`}>
									{post.status === 'published' ? 'Published' : 'Draft'}
								</span>
								<div className="flex flex-1 flex-col">
									<Link href={`/admin/blog/${post.id}`} className="hover:underline">{title}</Link>
									<span className="text-xs text-zinc-500">/{post.slug}</span>
								</div>
								<span className="flex gap-1 text-xs">
									{LOCALES.map((l) => (
										<span key={l} className={`rounded px-1.5 py-0.5 ${post.translations[l] ? 'bg-zinc-700 text-zinc-100' : 'text-zinc-600 line-through'}`}>
											{l}
										</span>
									))}
								</span>
								<form action={deletePost}>
									<input type="hidden" name="id" value={post.id} />
									<DeletePostButton title={title} />
								</form>
							</li>
						);
					})}
				</ul>
			)}
		</main>
	);
}
