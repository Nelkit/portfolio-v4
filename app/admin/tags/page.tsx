import Link from 'next/link';
import { requireAdmin } from '@/app/lib/auth/admin';
import { tagRepository } from '@/app/lib/content/tags/tag-service';
import { postRepository } from '@/app/lib/content/posts/post-service';
import { LOCALES, type Locale } from '@/app/lib/i18n/locales';
import { TagsEditor, type TagRow } from './TagsEditor';

export const dynamic = 'force-dynamic';

export default async function TagsAdminPage() {
	await requireAdmin();
	const [tags, posts] = await Promise.all([tagRepository().listTags(), postRepository().listPosts()]);
	const rows: TagRow[] = tags.map((tag) => ({
		id: tag.id,
		slug: tag.slug,
		names: Object.fromEntries(LOCALES.map((l) => [l, tag.translations[l]?.name ?? ''])) as Record<Locale, string>,
		posts: posts.filter((p) => p.tagIds.includes(tag.id)).length,
	}));

	return (
		<main className="flex flex-col gap-6">
			<Link href="/admin" className="text-sm text-zinc-400 hover:text-zinc-100">← Dashboard</Link>
			<h1 className="text-xl font-semibold">Blog tags</h1>
			<p className="text-sm text-zinc-500">Assign tags to posts from the post editor. Visitors filter the blog by tag and see related posts.</p>
			<TagsEditor key={rows.map((r) => `${r.id}:${r.slug}:${r.names.en}:${r.names.es}:${r.posts}`).join('|')} initial={rows} />
		</main>
	);
}
