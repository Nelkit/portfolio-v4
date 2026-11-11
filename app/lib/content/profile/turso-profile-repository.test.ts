import { beforeEach, describe, expect, it } from 'vitest';
import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import { migrate } from 'drizzle-orm/libsql/migrator';
import { createTursoProfileRepository } from './turso-profile-repository';
import type { ProfileRepository } from './profile-repository';
import type { ProfileInput } from './profile';

const translation = (lang: string, cvKey: string | null = null) => ({
	role: `role-${lang}`,
	intro: `intro-${lang}`,
	cvKey,
	contactAvailable: `available-${lang}`,
	contactHeadline: `headline-${lang}`,
	contactDescription: `description-${lang}`,
});

const input: ProfileInput = {
	name: 'Nelkit',
	avatarKey: 'profile/avatar-1.webp',
	translations: { en: translation('en', 'profile/cv-en.pdf'), es: translation('es') },
	links: [
		{ type: 'github', label: 'GitHub', url: 'https://github.com/nelkit' },
		{ type: 'linkedin', label: 'LinkedIn', url: 'https://linkedin.com/in/nelkit' },
	],
};

describe('TursoProfileRepository', () => {
	let repo: ProfileRepository;

	beforeEach(async () => {
		const db = drizzle(createClient({ url: ':memory:' }));
		await migrate(db, { migrationsFolder: './drizzle' });
		repo = createTursoProfileRepository(db);
	});

	it('returns null before anything is saved', async () => {
		expect(await repo.getProfileData()).toBeNull();
	});

	it('saves and reads back the whole profile', async () => {
		await repo.saveProfile(input);
		expect(await repo.getProfileData()).toEqual(input);
	});

	it('replaces links on save, keeping the new order', async () => {
		await repo.saveProfile(input);
		const reordered = [input.links[1], { type: 'email' as const, label: 'Email', url: 'mailto:a@b.co' }];
		await repo.saveProfile({ ...input, links: reordered });
		expect((await repo.getProfileData())?.links).toEqual(reordered);
	});

	it('overwrites profile fields on a second save', async () => {
		await repo.saveProfile(input);
		await repo.saveProfile({ ...input, name: 'Renamed', avatarKey: null });
		const data = await repo.getProfileData();
		expect(data?.name).toBe('Renamed');
		expect(data?.avatarKey).toBeNull();
	});
});
