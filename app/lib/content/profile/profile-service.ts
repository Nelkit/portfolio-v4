import { cachedRead } from '@/app/lib/cache/cached-read';
import { getDb } from '@/app/lib/db/client';
import type { Locale } from '@/app/lib/i18n/locales';
import { publicUrlFor } from '@/app/lib/storage/storage';
import { toPublicProfile } from './profile';
import { createTursoProfileRepository } from './turso-profile-repository';
import type { ProfileRepository } from './profile-repository';

/** Cache tag for every public read of profile data; invalidated on admin saves. */
export const PROFILE_TAG = 'profile';

export function profileRepository(): ProfileRepository {
	return createTursoProfileRepository(getDb());
}

/** Public-site read, cached until the admin saves the profile. */
export const getPublishedProfile = cachedRead(
	async (locale: Locale) => toPublicProfile(await profileRepository().getProfileData(), locale, publicUrlFor),
	['profile'],
	[PROFILE_TAG],
);
