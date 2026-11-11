import { describe, expect, it } from 'vitest';
import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import { migrate } from 'drizzle-orm/libsql/migrator';
import { backupKey, dumpDatabase, isAuthorizedCron } from './backup';
import { createTursoAreaRepository } from '@/app/lib/content/areas/turso-area-repository';

describe('isAuthorizedCron', () => {
	it('accepts only "Bearer <CRON_SECRET>"', () => {
		expect(isAuthorizedCron('Bearer s3cret-value-long-enough', 's3cret-value-long-enough')).toBe(true);
		expect(isAuthorizedCron('Bearer wrong', 's3cret-value-long-enough')).toBe(false);
		expect(isAuthorizedCron(null, 's3cret-value-long-enough')).toBe(false);
	});

	it('rejects everything when CRON_SECRET is not configured', () => {
		expect(isAuthorizedCron('Bearer ', undefined)).toBe(false);
		expect(isAuthorizedCron('Bearer ', '')).toBe(false);
	});
});

describe('backupKey', () => {
	it('is one file per UTC day', () => {
		expect(backupKey(new Date(Date.UTC(2026, 10, 11, 23, 59)))).toBe('backups/2026-11-11.json');
	});
});

describe('dumpDatabase', () => {
	it('exports every application table with its rows', async () => {
		const db = drizzle(createClient({ url: ':memory:' }));
		await migrate(db, { migrationsFolder: './drizzle' });
		await createTursoAreaRepository(db).createArea({ translations: { en: { name: 'ML' }, es: { name: 'AA' } } });

		const dump = await dumpDatabase(db, new Date(Date.UTC(2026, 0, 2)));
		expect(dump.exportedAt).toBe('2026-01-02T00:00:00.000Z');
		expect(dump.tables.expertise_areas).toHaveLength(1);
		expect(dump.tables.expertise_area_translations).toHaveLength(2);
		expect(Object.keys(dump.tables)).toEqual(expect.arrayContaining(['posts', 'projects', 'profile', 'skills', 'tags']));
		expect(dump.tables.posts).toEqual([]);
	});
});
