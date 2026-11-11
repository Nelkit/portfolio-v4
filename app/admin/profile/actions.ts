'use server';

import { updateTag } from 'next/cache';
import { requireAdmin } from '@/app/lib/auth/admin';
import { parseProfileForm, type ProfileInput } from '@/app/lib/content/profile/profile';
import { PROFILE_TAG, profileRepository } from '@/app/lib/content/profile/profile-service';
import { LOCALES } from '@/app/lib/i18n/locales';
import { validateUpload, type UploadKind } from '@/app/lib/storage/file-validation';
import { buildKey, getStorage, type FileStorage } from '@/app/lib/storage/storage';

export type SaveProfileState = { ok?: boolean; errors?: Record<string, string> };

type PendingUpload = { field: string; key: string; bytes: Uint8Array; contentType: string };

/** Reads an optional file input; an empty input (no file chosen) is `null`. */
async function readFile(formData: FormData, field: string): Promise<Uint8Array | null> {
	const file = formData.get(field);
	if (!(file instanceof File) || file.size === 0) return null;
	return new Uint8Array(await file.arrayBuffer());
}

export async function saveProfile(_prev: SaveProfileState, formData: FormData): Promise<SaveProfileState> {
	await requireAdmin();

	const parsed = parseProfileForm(Object.fromEntries(formData));
	const errors: Record<string, string> = parsed.ok ? {} : { ...parsed.errors };

	// 1. Validate every chosen file BEFORE touching storage or the database.
	const uploads: PendingUpload[] = [];
	const fileFields: { field: string; kind: UploadKind; prefix: string }[] = [
		{ field: 'avatar', kind: 'image', prefix: 'profile/avatar' },
		...LOCALES.map((locale) => ({ field: `cv_${locale}`, kind: 'pdf' as const, prefix: `profile/cv-${locale}` })),
	];
	for (const { field, kind, prefix } of fileFields) {
		const bytes = await readFile(formData, field);
		if (!bytes) continue;
		const check = validateUpload(bytes, kind);
		if (!check.ok) errors[field] = check.error;
		else uploads.push({ field, key: buildKey(prefix, check.ext), bytes, contentType: check.contentType });
	}

	if (!parsed.ok || Object.keys(errors).length > 0) return { errors };

	// 2. Work out the final file keys: new upload > removal > keep the current one.
	const repo = profileRepository();
	const current = await repo.getProfileData();
	const uploaded = (field: string) => uploads.find((u) => u.field === field)?.key;
	const resolveKey = (field: string, currentKey: string | null | undefined) =>
		uploaded(field) ?? (formData.get(`remove_${field}`) === 'on' ? null : currentKey ?? null);

	const input: ProfileInput = {
		name: parsed.value.name,
		avatarKey: resolveKey('avatar', current?.avatarKey),
		links: parsed.value.links,
		translations: Object.fromEntries(
			LOCALES.map((locale) => [
				locale,
				{
					...parsed.value.translations[locale],
					cvKey: resolveKey(`cv_${locale}`, current?.translations[locale]?.cvKey),
				},
			]),
		) as ProfileInput['translations'],
	};

	// 3. Upload, then save. If saving fails, remove what was just uploaded.
	let storage: FileStorage | undefined;
	try {
		storage = getStorage();
	} catch (error) {
		if (uploads.length > 0) return { errors: { form: (error as Error).message } };
	}
	if (storage) await Promise.all(uploads.map((u) => storage.put(u.key, u.bytes, u.contentType)));

	try {
		await repo.saveProfile(input);
	} catch (error) {
		if (storage) await Promise.allSettled(uploads.map((u) => storage.delete(u.key)));
		throw error;
	}

	// 4. Best effort: delete files that are no longer referenced.
	const before = [current?.avatarKey, ...LOCALES.map((l) => current?.translations[l]?.cvKey)];
	const after = new Set([input.avatarKey, ...LOCALES.map((l) => input.translations[l].cvKey)]);
	const orphans = before.filter((key): key is string => Boolean(key) && !after.has(key!));
	if (storage) await Promise.allSettled(orphans.map((key) => storage.delete(key)));

	updateTag(PROFILE_TAG);
	return { ok: true };
}
