import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createClient, type Client } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import { migrate } from 'drizzle-orm/libsql/migrator';
import { copyDatabase, mediaKeys, readSnapshot, restoreSnapshot } from './database-copy';

async function migrated(): Promise<Client> {
	const client = createClient({ url: ':memory:' });
	await migrate(drizzle(client), { migrationsFolder: './drizzle' });
	return client;
}

async function seed(db: Client) {
	await db.execute("INSERT INTO expertise_areas (id, position) VALUES (7, 0)");
	await db.execute("INSERT INTO projects (id, slug, area_id, position, image_key) VALUES (3, 'horus', 7, 0, 'projects/3/cover-a.webp')");
	await db.execute("INSERT INTO project_translations (project_id, locale, title, summary) VALUES (3, 'es', 'Título ñ', 'x')");
	await db.execute("INSERT INTO project_screenshots (project_id, key, position) VALUES (3, 'projects/3/shot-b.png', 0)");
	await db.execute("INSERT INTO project_links (project_id, type, label, url, position) VALUES (3, 'link', 'video-demo', 'https://media.test/demos/v.mp4', 0)");
}

const count = async (db: Client, table: string) => Number((await db.execute(`SELECT count(*) n FROM ${table}`)).rows[0].n);

describe('database backup', () => {
	let dir: string;
	beforeEach(() => { dir = mkdtempSync(join(tmpdir(), 'bk-')); });
	afterEach(() => rmSync(dir, { recursive: true, force: true }));

	it('copies every table to a SQLite file and reads back the same rows', async () => {
		const db = await migrated();
		await seed(db);
		const snapshot = await readSnapshot(db);
		const file = createClient({ url: `file:${join(dir, 'db.sqlite')}` });
		await copyDatabase(snapshot, file);
		expect((await readSnapshot(file)).tables).toEqual(snapshot.tables);
		expect((await file.execute('PRAGMA integrity_check')).rows[0].integrity_check).toBe('ok');
		file.close();
	});

	it('restores the saved state over later changes, keeping ids', async () => {
		const db = await migrated();
		await seed(db);
		const snapshot = await readSnapshot(db);
		await db.execute("UPDATE projects SET slug = 'changed'");
		await db.execute("INSERT INTO projects (id, slug, area_id, position) VALUES (9, 'later', 7, 1)");
		await restoreSnapshot(snapshot, db);
		expect((await readSnapshot(db)).tables).toEqual(snapshot.tables);
	});

	it('restores into a freshly migrated empty database', async () => {
		const db = await migrated();
		await seed(db);
		const other = await migrated();
		await restoreSnapshot(await readSnapshot(db), other);
		expect(await count(other, 'projects')).toBe(1);
		expect(await count(other, 'project_screenshots')).toBe(1);
	});

	it('changes nothing when any row fails', async () => {
		const db = await migrated();
		await seed(db);
		const snapshot = await readSnapshot(db);
		const projects = snapshot.tables.find((t) => t.name === 'projects')!;
		projects.rows.push([...projects.rows[0]]); // duplicate id
		await expect(restoreSnapshot(snapshot, db)).rejects.toThrow();
		expect(await count(db, 'projects')).toBe(1);
		expect(await count(db, 'project_translations')).toBe(1);
	});

	it('refuses a target without the tables (migrations not applied)', async () => {
		const db = await migrated();
		const snapshot = await readSnapshot(db);
		await expect(restoreSnapshot(snapshot, createClient({ url: ':memory:' }))).rejects.toThrow(/db:migrate/);
	});

	it('restores a backup older than a column: the new column gets its default', async () => {
		const db = await migrated();
		await seed(db);
		const snapshot = await readSnapshot(db);
		const projects = snapshot.tables.find((t) => t.name === 'projects')!;
		const i = projects.columns.indexOf('screenshots_position');
		projects.columns.splice(i, 1);
		projects.rows.forEach((r) => r.splice(i, 1));
		await restoreSnapshot(snapshot, db);
		expect((await db.execute('SELECT screenshots_position p FROM projects')).rows[0].p).toBe('bottom');
	});

	it('does not touch the migration history of the target', async () => {
		const db = await migrated();
		const snapshot = await readSnapshot(db);
		const before = await count(db, '__drizzle_migrations');
		snapshot.tables.find((t) => t.name === '__drizzle_migrations')!.rows = [];
		await restoreSnapshot(snapshot, db);
		expect(await count(db, '__drizzle_migrations')).toBe(before);
	});
});

describe('mediaKeys', () => {
	it('finds key columns, files linked by URL and images inside Markdown', async () => {
		const db = await migrated();
		await seed(db);
		await db.execute("UPDATE project_translations SET description = '![a](upload:blog/1/img-c.webp) and ![b](https://media.test/x/y.png)'");
		expect(mediaKeys(await readSnapshot(db), 'https://media.test/')).toEqual([
			'blog/1/img-c.webp', 'demos/v.mp4', 'projects/3/cover-a.webp', 'projects/3/shot-b.png', 'x/y.png',
		]);
	});
});
