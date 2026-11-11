import { beforeEach, describe, expect, it } from 'vitest';
import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import { migrate } from 'drizzle-orm/libsql/migrator';
import { createTursoCareerRepository } from './turso-career-repository';
import type { CareerRepository } from './career-repository';
import type { CareerInput } from './career';

const entry = (title: string, start: [number, number], end: [number, number] | null): CareerInput => ({
	start: { year: start[0], month: start[1] },
	end: end ? { year: end[0], month: end[1] } : null,
	translations: { en: { title, detail: 'd' }, es: { title: `${title}-es`, detail: '' } },
});

describe('TursoCareerRepository', () => {
	let repo: CareerRepository;

	beforeEach(async () => {
		const db = drizzle(createClient({ url: ':memory:' }));
		await migrate(db, { migrationsFolder: './drizzle' });
		repo = createTursoCareerRepository(db);
	});

	it('creates entries and lists them current-first, newest first', async () => {
		const old = await repo.createEntry(entry('Old', [2016, 1], [2018, 6]));
		const now = await repo.createEntry(entry('Now', [2021, 3], null));
		const mid = await repo.createEntry(entry('Mid', [2018, 7], [2021, 2]));
		expect((await repo.listEntries()).map((e) => e.id)).toEqual([now, mid, old]);
		expect(await repo.getEntry(now)).toEqual({ id: now, ...entry('Now', [2021, 3], null) });
	});

	it('updates dates and texts (a current role can be closed)', async () => {
		const id = await repo.createEntry(entry('Role', [2021, 3], null));
		await repo.updateEntry(id, entry('Role v2', [2021, 3], [2024, 1]));
		expect(await repo.getEntry(id)).toEqual({ id, ...entry('Role v2', [2021, 3], [2024, 1]) });
	});

	it('deletes an entry with its translations', async () => {
		const id = await repo.createEntry(entry('Role', [2021, 3], null));
		await repo.deleteEntry(id);
		expect(await repo.getEntry(id)).toBeNull();
		expect(await repo.listEntries()).toEqual([]);
	});
});
