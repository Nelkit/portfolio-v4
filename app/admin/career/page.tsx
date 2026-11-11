import Link from 'next/link';
import { requireAdmin } from '@/app/lib/auth/admin';
import { careerRepository } from '@/app/lib/content/career/career-service';
import { toMonthInput, type CareerTranslation } from '@/app/lib/content/career/career';
import { LOCALES, type Locale } from '@/app/lib/i18n/locales';
import { CareerEditor, type CareerRow } from './CareerEditor';

export const dynamic = 'force-dynamic';

export default async function CareerAdminPage() {
	await requireAdmin();
	const entries = await careerRepository().listEntries();
	const blank: CareerTranslation = { title: '', detail: '' };

	const rows: CareerRow[] = entries.map((e) => ({
		id: e.id,
		start: toMonthInput(e.start),
		end: toMonthInput(e.end),
		texts: Object.fromEntries(LOCALES.map((l) => [l, e.translations[l] ?? blank])) as Record<Locale, CareerTranslation>,
	}));

	return (
		<main className="flex flex-col gap-6">
			<Link href="/admin" className="text-sm text-zinc-400 hover:text-zinc-100">← Dashboard</Link>
			<h1 className="text-xl font-semibold">Career</h1>
			<p className="text-sm text-zinc-500">Entries are ordered automatically: current roles first, then newest first.</p>
			<CareerEditor
				key={rows.map((r) => `${r.id}:${r.start}:${r.end}:${r.texts.en.title}:${r.texts.es.title}`).join('|')}
				initial={rows}
			/>
		</main>
	);
}
