/**
 * Copies a libSQL/Turso database table by table (unit tested). Works on what
 * is really in the database, not on the Drizzle schema, so it needs no changes
 * when the schema grows.
 */
import type { Client, InStatement, Value } from '@libsql/client';

export type TableSnapshot = { name: string; columns: string[]; rows: Value[][] };
export type Snapshot = {
	/** CREATE TABLE / CREATE INDEX statements, tables first. */
	ddl: string[];
	tables: TableSnapshot[];
};

/** Copied to the backup for reference; a restore never changes it. */
export const MIGRATIONS_TABLE = '__drizzle_migrations';

const quote = (identifier: string) => `"${identifier.replace(/"/g, '""')}"`;

const OWN_OBJECTS = `sql IS NOT NULL AND name NOT LIKE 'sqlite\\_%' ESCAPE '\\' AND name NOT LIKE 'libsql\\_%' ESCAPE '\\'`;

async function tableNames(db: Client): Promise<string[]> {
	const { rows } = await db.execute(`SELECT name FROM sqlite_master WHERE type = 'table' AND ${OWN_OBJECTS} ORDER BY name`);
	return rows.map((r) => String(r.name));
}

/** Reads everything in one read transaction, so the copy is consistent. */
export async function readSnapshot(db: Client): Promise<Snapshot> {
	const names = await tableNames(db);
	const [master, ...results] = await db.batch(
		[
			`SELECT sql FROM sqlite_master WHERE type IN ('table', 'index') AND ${OWN_OBJECTS} ORDER BY type = 'index', name`,
			...names.map((name) => `SELECT * FROM ${quote(name)}`),
		],
		'read',
	);
	return {
		ddl: master.rows.map((r) => String(r.sql)),
		tables: results.map((result, i) => ({
			name: names[i],
			columns: result.columns,
			rows: result.rows.map((row) => result.columns.map((_, c) => row[c])),
		})),
	};
}

function insertStatements({ name, columns, rows }: TableSnapshot): InStatement[] {
	const sql = `INSERT INTO ${quote(name)} (${columns.map(quote).join(', ')}) VALUES (${columns.map(() => '?').join(', ')})`;
	return rows.map((args) => ({ sql, args }));
}

/** Parents before children, following the foreign keys of `db`. */
async function parentsFirst(db: Client, tables: TableSnapshot[]): Promise<TableSnapshot[]> {
	const byName = new Map(tables.map((t) => [t.name, t]));
	const ordered: TableSnapshot[] = [];
	const visited = new Set<string>();
	const visit = async (table: TableSnapshot) => {
		if (visited.has(table.name)) return;
		visited.add(table.name);
		const { rows } = await db.execute(`PRAGMA foreign_key_list(${quote(table.name)})`);
		for (const row of rows) {
			const parent = byName.get(String(row.table));
			if (parent) await visit(parent);
		}
		ordered.push(table);
	};
	for (const table of tables) await visit(table);
	return ordered;
}

/** Writes the snapshot to an empty database (the backup file). */
export async function copyDatabase(snapshot: Snapshot, target: Client): Promise<void> {
	await target.batch(snapshot.ddl, 'write');
	const ordered = await parentsFirst(target, snapshot.tables);
	const inserts = ordered.flatMap(insertStatements);
	if (inserts.length > 0) await target.batch(inserts, 'write');
}

/** Throws when the target cannot hold the backup; returns the tables to restore. */
export async function checkTarget(snapshot: Snapshot, target: Client): Promise<TableSnapshot[]> {
	const tables = snapshot.tables.filter((t) => t.name !== MIGRATIONS_TABLE);
	const existing = new Set(await tableNames(target));
	for (const table of tables) {
		if (!existing.has(table.name)) {
			throw new Error(`The target database has no table "${table.name}". Run pnpm db:migrate on it first.`);
		}
		const { rows } = await target.execute(`PRAGMA table_info(${quote(table.name)})`);
		const columns = new Set(rows.map((r) => String(r.name)));
		const missing = table.columns.filter((c) => !columns.has(c));
		if (missing.length > 0) {
			throw new Error(`The target table "${table.name}" has no column ${missing.join(', ')}. Run pnpm db:migrate, or restore with the code of that backup.`);
		}
	}
	return tables;
}

/**
 * Replaces the rows of every table in the backup. One atomic batch: if any
 * statement fails, nothing changes. Columns newer than the backup get their
 * default; tables newer than the backup are left alone.
 */
export async function restoreSnapshot(snapshot: Snapshot, target: Client): Promise<void> {
	const ordered = await parentsFirst(target, await checkTarget(snapshot, target));
	await target.batch(
		[
			...[...ordered].reverse().map((t) => `DELETE FROM ${quote(t.name)}`),
			...ordered.flatMap(insertStatements),
		],
		'write',
	);
}

/** Migrations applied, as a comparable value. */
export function migrationHashes(snapshot: Snapshot): string[] {
	const table = snapshot.tables.find((t) => t.name === MIGRATIONS_TABLE);
	const hash = table?.columns.indexOf('hash') ?? -1;
	return table && hash >= 0 ? table.rows.map((r) => String(r[hash])) : [];
}

/** Storage keys the content uses: key columns, URLs of the media domain and `upload:` images. */
export function mediaKeys(snapshot: Snapshot, publicUrl: string): string[] {
	const base = publicUrl.replace(/\/+$/, '') + '/';
	const escaped = base.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
	const inText = new RegExp(`(?:${escaped}|\\bupload:)([A-Za-z0-9_/-]+\\.[A-Za-z0-9]+)`, 'g');
	const keys = new Set<string>();
	for (const { columns, rows } of snapshot.tables) {
		for (const row of rows) {
			row.forEach((value, i) => {
				if (typeof value !== 'string' || value === '') return;
				if (columns[i] === 'key' || columns[i].endsWith('_key')) keys.add(value);
				else for (const match of value.matchAll(inText)) keys.add(match[1]);
			});
		}
	}
	return [...keys].sort();
}
