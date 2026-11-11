import Link from 'next/link';
import { requireAdmin } from '@/app/lib/auth/admin';
import { skillCategoryRepository } from '@/app/lib/content/skills/skill-service';
import { LOCALES, type Locale } from '@/app/lib/i18n/locales';
import { SkillsEditor, type CategoryRow } from './SkillsEditor';

export const dynamic = 'force-dynamic';

export default async function SkillsAdminPage() {
	await requireAdmin();
	const repo = skillCategoryRepository();
	const [categories, catalog] = await Promise.all([repo.listCategories(), repo.listSkills()]);

	const rows: CategoryRow[] = categories.map((c) => ({
		id: c.id,
		names: Object.fromEntries(LOCALES.map((l) => [l, c.translations[l]?.name ?? ''])) as Record<Locale, string>,
		skills: c.skills.map((s) => s.name),
	}));

	return (
		<main className="flex flex-col gap-6">
			<Link href="/admin" className="text-sm text-zinc-400 hover:text-zinc-100">← Dashboard</Link>
			<h1 className="text-xl font-semibold">Tech stack</h1>
			<p className="text-sm text-zinc-500">
				Each category is a tab in the stack section. A skill can be in several categories; skills not used by any category are removed from the catalog.
			</p>
			<SkillsEditor
				key={rows.map((r) => `${r.id}:${r.names.en}:${r.skills.join(',')}`).join('|')}
				initial={rows}
				catalog={catalog.map((s) => s.name)}
			/>
		</main>
	);
}
