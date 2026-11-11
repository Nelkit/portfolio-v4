import { createClient } from '@libsql/client';
import { drizzle, type LibSQLDatabase } from 'drizzle-orm/libsql';

export type Database = LibSQLDatabase;

let db: Database | undefined;

/**
 * Lazily creates a single Turso/libSQL connection per server instance.
 * Locally, TURSO_DATABASE_URL can be a file (e.g. `file:local.db`).
 */
export function getDb(): Database {
	if (!db) {
		const url = process.env.TURSO_DATABASE_URL;
		if (!url) throw new Error('TURSO_DATABASE_URL is not set');
		db = drizzle(createClient({ url, authToken: process.env.TURSO_AUTH_TOKEN || undefined }));
	}
	return db;
}
