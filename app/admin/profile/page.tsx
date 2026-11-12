import Link from 'next/link';
import { requireAdmin } from '@/app/lib/auth/admin';
import { profileRepository } from '@/app/lib/content/profile/profile-service';
import { publicUrlFor } from '@/app/lib/storage/storage';
import { ProfileForm, type ProfileFormInitial } from './ProfileForm';
import { LOCALES } from '@/app/lib/i18n/locales';

export const dynamic = 'force-dynamic';

export default async function ProfileAdminPage() {
	await requireAdmin();
	// Uncached read: the editor always shows what is in the database.
	const data = await profileRepository().getProfileData();

	const initial: ProfileFormInitial = {
		name: data?.name ?? '',
		avatarUrl: data?.avatarKey ? publicUrlFor(data.avatarKey) : null,
		links: data?.links ?? [],
		translations: Object.fromEntries(
			LOCALES.map((locale) => {
				const t = data?.translations[locale];
				return [
					locale,
					{
						role: t?.role ?? '',
						intro: t?.intro ?? '',
						contactAvailable: t?.contactAvailable ?? '',
						contactHeadline: t?.contactHeadline ?? '',
						contactDescription: t?.contactDescription ?? '',
						cvUrl: t?.cvKey ? publicUrlFor(t.cvKey) : null,
					},
				];
			}),
		) as ProfileFormInitial['translations'],
	};

	return (
		<main className="flex flex-col gap-6">
			<Link href="/admin" className="text-sm text-ui-dim hover:text-ui-text">
				← Dashboard
			</Link>
			<h1 className="text-xl font-semibold">Profile</h1>
			<ProfileForm initial={initial} />
		</main>
	);
}
