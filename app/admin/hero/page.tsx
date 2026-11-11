import Link from 'next/link';
import { requireAdmin } from '@/app/lib/auth/admin';
import { heroRepository } from '@/app/lib/content/hero/hero-service';
import { LOCALES, type Locale } from '@/app/lib/i18n/locales';
import { HeadlineForm } from './HeadlineForm';

export const dynamic = 'force-dynamic';

export default async function HeroAdminPage() {
	await requireAdmin();

	// Uncached reads: the editor always shows what is in the database.
	const repo = heroRepository();
	const heroes = await Promise.all(LOCALES.map((locale) => repo.getHero(locale)));
	const initial = Object.fromEntries(
		LOCALES.map((locale, i) => [locale, heroes[i]?.headline ?? '']),
	) as Record<Locale, string>;

	return (
		<main className="flex flex-col gap-6">
			<Link href="/admin" className="text-sm text-zinc-400 hover:text-zinc-100">
				← Dashboard
			</Link>
			<h1 className="text-xl font-semibold">Hero</h1>
			<HeadlineForm initial={initial} />
		</main>
	);
}
