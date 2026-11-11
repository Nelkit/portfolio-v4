import Link from 'next/link';
import { notFound } from 'next/navigation';
import { requireAdmin } from '@/app/lib/auth/admin';
import { postRepository } from '@/app/lib/content/posts/post-service';
import { LOCALES } from '@/app/lib/i18n/locales';
import { PostEditor } from '../PostEditor';
import { publicUrlFor, uploadBaseUrl } from '@/app/lib/storage/storage';

export const dynamic = 'force-dynamic';

export default async function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
	await requireAdmin();
	const id = Number((await params).id);
	if (!Number.isInteger(id) || id <= 0) notFound();

	// Uncached read: the editor always shows what is in the database.
	const repo = postRepository();
	const [post, images] = await Promise.all([repo.getPost(id), repo.listPostImages(id)]);
	if (!post) notFound();
	const viewLocale = LOCALES.find((l) => post.translations[l]) ?? 'en';

	return (
		<main className="flex flex-col gap-6">
			<Link href="/admin/blog" className="text-sm text-zinc-400 hover:text-zinc-100">← Blog</Link>
			<header className="flex items-center justify-between">
				<h1 className="text-xl font-semibold">Edit post</h1>
				<a href={`/${viewLocale}/blog/${post.slug}`} target="_blank" rel="noreferrer" className="text-sm text-zinc-400 hover:text-zinc-100">
					View on site ↗
				</a>
			</header>
			<PostEditor
				key={`${post.id}:${post.slug}`}
				id={post.id}
				initial={post}
				uploadBaseUrl={uploadBaseUrl()}
				media={{
					coverUrl: post.coverKey ? publicUrlFor(post.coverKey) : null,
					images: images.map((i) => ({ ...i, url: publicUrlFor(i.key) })),
				}}
			/>
		</main>
	);
}
