import Link from 'next/link';
import { requireAdmin } from '@/app/lib/auth/admin';
import { PostEditor } from '../PostEditor';

export const dynamic = 'force-dynamic';

export default async function NewPostPage() {
	await requireAdmin();
	const today = new Date().toISOString().slice(0, 10);
	return (
		<main className="flex flex-col gap-6">
			<Link href="/admin/blog" className="text-sm text-zinc-400 hover:text-zinc-100">← Blog</Link>
			<h1 className="text-xl font-semibold">New post</h1>
			<PostEditor initial={{ slug: '', publishedOn: today, translations: {} }} />
		</main>
	);
}
