import { timingSafeEqual } from 'node:crypto';
import { getTableName, is } from 'drizzle-orm';
import type { LibSQLDatabase } from 'drizzle-orm/libsql';
import { SQLiteTable } from 'drizzle-orm/sqlite-core';
import * as schema from '@/app/lib/db/schema';

export type DatabaseDump = { version: 1; exportedAt: string; tables: Record<string, unknown[]> };

/** Every table defined in the schema — new tables are backed up automatically. */
const TABLES: SQLiteTable[] = (Object.values(schema) as unknown[]).filter((value): value is SQLiteTable =>
	is(value, SQLiteTable),
);

/** Reads every application table. Also keeps the Turso database active (no archiving). */
export async function dumpDatabase(db: LibSQLDatabase, now = new Date()): Promise<DatabaseDump> {
	const entries = await Promise.all(TABLES.map(async (table) => [getTableName(table), await db.select().from(table)] as const));
	return { version: 1, exportedAt: now.toISOString(), tables: Object.fromEntries(entries) };
}

/** One backup per UTC day; a re-run the same day overwrites it. */
export function backupKey(now = new Date()): string {
	return `backups/${now.toISOString().slice(0, 10)}.json`;
}

/** Vercel Cron sends `Authorization: Bearer <CRON_SECRET>`. Without a secret, nothing is authorized. */
export function isAuthorizedCron(authorization: string | null, secret: string | undefined): boolean {
	if (!secret || !authorization) return false;
	const expected = Buffer.from(`Bearer ${secret}`);
	const received = Buffer.from(authorization);
	return expected.length === received.length && timingSafeEqual(expected, received);
}
