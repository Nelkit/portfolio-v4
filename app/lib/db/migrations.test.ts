import { describe, expect, it } from 'vitest';
import { cpSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createClient } from '@libsql/client';
import { sql } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/libsql';
import { migrate } from 'drizzle-orm/libsql/migrator';

/** A copy of ./drizzle that only knows the first `count` migrations. */
function migrationsUpTo(count: number): { folder: string; cleanup: () => void } {
	const folder = mkdtempSync(join(tmpdir(), 'migrations-'));
	cpSync('./drizzle', folder, { recursive: true });
	const journalPath = join(folder, 'meta', '_journal.json');
	const journal = JSON.parse(readFileSync(journalPath, 'utf8'));
	journal.entries = journal.entries.slice(0, count);
	writeFileSync(journalPath, JSON.stringify(journal));
	return { folder, cleanup: () => rmSync(folder, { recursive: true, force: true }) };
}

describe('migration 0013 (featured, year, required category)', () => {
	it('keeps existing projects and gives a project without area the first area', async () => {
		const db = drizzle(createClient({ url: ':memory:' }));
		const before = migrationsUpTo(13); // 0000 … 0012
		try {
			await migrate(db, { migrationsFolder: before.folder });
		} finally {
			before.cleanup();
		}

		await db.run(sql`INSERT INTO expertise_areas (id, position) VALUES (5, 1), (2, 0)`);
		await db.run(sql`INSERT INTO projects (id, slug, company, area_id, position) VALUES (1, 'with-area', '2021 · Ryte', 5, 0), (2, 'no-area', '', NULL, 1)`);
		await db.run(sql`INSERT INTO project_translations (project_id, locale, title, summary) VALUES (1, 'en', 'T', 'S')`);

		await migrate(db, { migrationsFolder: './drizzle' });

		const rows = await db.all<{ slug: string; company: string; area_id: number; year: number | null; featured: number; featured_order: number }>(
			sql`SELECT slug, company, area_id, year, featured, featured_order FROM projects ORDER BY id`,
		);
		expect(rows).toEqual([
			{ slug: 'with-area', company: '2021 · Ryte', area_id: 5, year: null, featured: 0, featured_order: 0 },
			{ slug: 'no-area', company: '', area_id: 2, year: null, featured: 0, featured_order: 0 },
		]);
		const [t] = await db.all<{ key_result: string; my_role: string }>(sql`SELECT key_result, my_role FROM project_translations`);
		expect(t).toEqual({ key_result: '', my_role: '' });
	});
});
