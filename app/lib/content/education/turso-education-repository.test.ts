import { beforeEach, describe, expect, it } from 'vitest';
import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import { migrate } from 'drizzle-orm/libsql/migrator';
import { createTursoEducationRepository } from './turso-education-repository';
import type { EducationRepository } from './education-repository';
import type { EducationInput } from './education';

const entry = (degree: string, start: [number, number], end: [number, number] | null, inProgress: boolean): EducationInput => ({
	start: { year: start[0], month: start[1] },
	end: end ? { year: end[0], month: end[1] } : null,
	inProgress,
	translations: {
		en: { degree, institution: 'Uni', description: 'x' },
		es: { degree: `${degree}-es`, institution: 'Uni', description: '' },
	},
});

describe('TursoEducationRepository', () => {
	let repo: EducationRepository;

	beforeEach(async () => {
		const db = drizzle(createClient({ url: ':memory:' }));
		await migrate(db, { migrationsFolder: './drizzle' });
		repo = createTursoEducationRepository(db);
	});

	it('creates entries and lists them in-progress first, newest first', async () => {
		const bsc = await repo.createEntry(entry('BSc', [2010, 3], [2015, 12], false));
		const msc = await repo.createEntry(entry('MSc', [2025, 2], [2026, 12], true));
		expect((await repo.listEntries()).map((e) => e.id)).toEqual([msc, bsc]);
		expect(await repo.getEntry(msc)).toEqual({ id: msc, ...entry('MSc', [2025, 2], [2026, 12], true) });
	});

	it('updates an entry (e.g. marks it completed)', async () => {
		const id = await repo.createEntry(entry('MSc', [2025, 2], null, true));
		await repo.updateEntry(id, entry('MSc', [2025, 2], [2026, 12], false));
		expect(await repo.getEntry(id)).toEqual({ id, ...entry('MSc', [2025, 2], [2026, 12], false) });
	});

	it('deletes an entry with its translations', async () => {
		const id = await repo.createEntry(entry('MSc', [2025, 2], null, true));
		await repo.deleteEntry(id);
		expect(await repo.getEntry(id)).toBeNull();
		expect(await repo.listEntries()).toEqual([]);
	});
});
