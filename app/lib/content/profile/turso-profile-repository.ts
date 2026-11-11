import { asc, eq, sql } from 'drizzle-orm';
import type { LibSQLDatabase } from 'drizzle-orm/libsql';
import { profile, profileTranslations, socialLinks } from '@/app/lib/db/schema';
import { isLocale } from '@/app/lib/i18n/routing';
import type { Locale } from '@/app/lib/i18n/locales';
import type { ProfileRepository } from './profile-repository';
import type { LinkType, ProfileTranslation } from './profile';

const PROFILE_ID = 1;

/** Adapter: ProfileRepository backed by Turso/libSQL through Drizzle. */
export function createTursoProfileRepository(db: LibSQLDatabase): ProfileRepository {
	return {
		async getProfileData() {
			const [rows, translationRows, linkRows] = await Promise.all([
				db.select().from(profile).where(eq(profile.id, PROFILE_ID)).limit(1),
				db.select().from(profileTranslations),
				db.select().from(socialLinks).orderBy(asc(socialLinks.position)),
			]);
			const row = rows[0];
			if (!row) return null;

			const translations: Partial<Record<Locale, ProfileTranslation>> = {};
			for (const t of translationRows) {
				if (!isLocale(t.locale)) continue;
				translations[t.locale] = {
					role: t.role,
					intro: t.intro,
					cvKey: t.cvKey,
					contactAvailable: t.contactAvailable,
					contactHeadline: t.contactHeadline,
					contactDescription: t.contactDescription,
				};
			}

			return {
				name: row.name,
				avatarKey: row.avatarKey,
				translations,
				links: linkRows.map((l) => ({ type: l.type as LinkType, label: l.label, url: l.url })),
			};
		},

		async saveProfile(input) {
			const now = sql`(unixepoch())`;
			const profileUpsert = db
				.insert(profile)
				.values({ id: PROFILE_ID, name: input.name, avatarKey: input.avatarKey })
				.onConflictDoUpdate({
					target: profile.id,
					set: { name: input.name, avatarKey: input.avatarKey, updatedAt: now },
				});

			const translationUpserts = (Object.entries(input.translations) as [Locale, ProfileTranslation][]).map(
				([locale, t]) =>
					db
						.insert(profileTranslations)
						.values({ locale, ...t })
						.onConflictDoUpdate({ target: profileTranslations.locale, set: { ...t, updatedAt: now } }),
			);

			const linkInserts = input.links.map((link, position) =>
				db.insert(socialLinks).values({ ...link, position }),
			);

			// One transaction: profile, every translation and the full link list.
			await db.batch([
				profileUpsert,
				...translationUpserts,
				db.delete(socialLinks),
				...linkInserts,
			]);
		},
	};
}
