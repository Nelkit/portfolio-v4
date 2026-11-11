import Link from 'next/link';
import { requireAdmin } from '@/app/lib/auth/admin';
import { educationRepository } from '@/app/lib/content/education/education-service';
import type { EducationTranslation } from '@/app/lib/content/education/education';
import { toMonthInput } from '@/app/lib/content/dates';
import { LOCALES, type Locale } from '@/app/lib/i18n/locales';
import { EducationEditor, type EducationRow } from './EducationEditor';

export const dynamic = 'force-dynamic';

export default async function EducationAdminPage() {
	await requireAdmin();
	const entries = await educationRepository().listEntries();
	const blank: EducationTranslation = { degree: '', institution: '', description: '' };

	const rows: EducationRow[] = entries.map((e) => ({
		id: e.id,
		start: toMonthInput(e.start),
		end: toMonthInput(e.end),
		inProgress: e.inProgress,
		texts: Object.fromEntries(LOCALES.map((l) => [l, e.translations[l] ?? blank])) as Record<Locale, EducationTranslation>,
	}));

	return (
		<main className="flex flex-col gap-6">
			<Link href="/admin" className="text-sm text-zinc-400 hover:text-zinc-100">← Dashboard</Link>
			<h1 className="text-xl font-semibold">Education</h1>
			<p className="text-sm text-zinc-500">Ordered automatically: in-progress entries first, then newest first.</p>
			<EducationEditor
				key={rows.map((r) => `${r.id}:${r.start}:${r.end}:${r.inProgress}:${r.texts.en.degree}:${r.texts.es.degree}`).join('|')}
				initial={rows}
			/>
		</main>
	);
}
