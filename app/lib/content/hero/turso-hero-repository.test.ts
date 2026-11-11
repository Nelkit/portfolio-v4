import { beforeEach, describe, expect, it } from 'vitest';
import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import { migrate } from 'drizzle-orm/libsql/migrator';
import { createTursoHeroRepository } from './turso-hero-repository';
import type { HeroRepository } from './hero-repository';

describe('TursoHeroRepository', () => {
	let repo: HeroRepository;

	beforeEach(async () => {
		const db = drizzle(createClient({ url: ':memory:' }));
		await migrate(db, { migrationsFolder: './drizzle' });
		repo = createTursoHeroRepository(db);
	});

	it('returns null when the locale has no hero yet', async () => {
		expect(await repo.getHero('en')).toBeNull();
	});

	it('saves and reads back a headline', async () => {
		await repo.saveHeadline('en', 'Hello <em>world</em>');
		expect(await repo.getHero('en')).toEqual({ locale: 'en', headline: 'Hello <em>world</em>' });
	});

	it('overwrites the headline on a second save (upsert)', async () => {
		await repo.saveHeadline('en', 'First');
		await repo.saveHeadline('en', 'Second');
		expect((await repo.getHero('en'))?.headline).toBe('Second');
	});

	it('saves headlines for several locales at once', async () => {
		await repo.saveHeadlines({ en: 'English', es: 'Español' });
		expect((await repo.getHero('en'))?.headline).toBe('English');
		expect((await repo.getHero('es'))?.headline).toBe('Español');
	});

	it('keeps each locale independent', async () => {
		await repo.saveHeadline('en', 'English');
		await repo.saveHeadline('es', 'Español');
		expect((await repo.getHero('en'))?.headline).toBe('English');
		expect((await repo.getHero('es'))?.headline).toBe('Español');
	});
});
