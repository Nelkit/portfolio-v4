'use server';

import { updateTag } from 'next/cache';
import { requireAdmin } from '@/app/lib/auth/admin';
import { parseHeroForm } from '@/app/lib/content/hero/hero';
import { HERO_TAG, heroRepository } from '@/app/lib/content/hero/hero-service';
import type { Locale } from '@/app/lib/i18n/locales';

export type SaveHeroState = { ok?: boolean; errors?: Partial<Record<Locale, string>> };

export async function saveHero(_prev: SaveHeroState, formData: FormData): Promise<SaveHeroState> {
	await requireAdmin();

	const parsed = parseHeroForm(Object.fromEntries(formData));
	if (!parsed.ok) return { errors: parsed.errors };

	// Both languages in one transaction: never leave the site half-updated.
	await heroRepository().saveHeadlines(parsed.headlines);
	updateTag(HERO_TAG); // every locale's public page refreshes on the next request
	return { ok: true };
}
