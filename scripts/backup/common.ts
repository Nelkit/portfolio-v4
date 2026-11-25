import { createHash } from 'node:crypto';
import { createRequire } from 'node:module';
import { existsSync, readdirSync } from 'node:fs';
import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import { dirname, join, resolve, sep } from 'node:path';
import { pathToFileURL } from 'node:url';
import { createClient, type Client } from '@libsql/client';
import type { FileStorage } from '@/app/lib/storage/storage';
import { copyDatabase, mediaKeys, readSnapshot } from './database-copy';

// @next/env is CommonJS: load it the way Next does, before anything reads process.env.
const { loadEnvConfig } = createRequire(import.meta.url)('@next/env') as typeof import('@next/env');
loadEnvConfig(process.cwd(), true, { info: () => {}, error: console.error });

export const BACKUPS_DIR = join(process.cwd(), 'backups');
export const DB_FILE = 'db.sqlite';
export const MANIFEST_FILE = 'manifest.json';

export type MediaEntry = { key: string; bytes: number; sha256: string };
export type Manifest = {
	version: 1;
	createdAt: string;
	database: string;
	rows: Record<string, number>;
	media: MediaEntry[];
	/** Referenced by the content but not downloadable when the backup was made. */
	missingMedia: string[];
};

export const sha256 = (bytes: Uint8Array) => createHash('sha256').update(bytes).digest('hex');

export function openDatabase(): { client: Client; label: string } {
	const url = process.env.TURSO_DATABASE_URL;
	if (!url) throw new Error('TURSO_DATABASE_URL is not set');
	return {
		client: createClient({ url, authToken: process.env.TURSO_AUTH_TOKEN || undefined }),
		// Host only: never print query strings or credentials.
		label: url.startsWith('file:') ? url : new URL(url).host,
	};
}

export const openBackupFile = (dir: string) => createClient({ url: pathToFileURL(join(dir, DB_FILE)).href });

/** Path of a media file inside a backup; throws if the key would leave the folder. */
export function mediaPath(dir: string, key: string): string {
	const root = resolve(dir, 'media');
	const path = resolve(root, key);
	if (!path.startsWith(root + sep)) throw new Error(`Unsafe media key: ${key}`);
	return path;
}

/** Reads a stored file: local disk in development (URL like /uploads/…), otherwise its public URL. */
export async function readStored(storage: FileStorage, key: string): Promise<Uint8Array> {
	const url = storage.publicUrl(key);
	if (url.startsWith('/')) return readFile(join(process.cwd(), 'public', url));
	const response = await fetch(url, { cache: 'no-store' });
	if (!response.ok) throw new Error(`HTTP ${response.status}`);
	return new Uint8Array(await response.arrayBuffer());
}

/** Complete backups, oldest first (folder names sort by date). */
export function listBackups(): string[] {
	if (!existsSync(BACKUPS_DIR)) return [];
	return readdirSync(BACKUPS_DIR)
		.filter((name) => existsSync(join(BACKUPS_DIR, name, MANIFEST_FILE)) && !name.endsWith('.partial'))
		.sort();
}

/** Copies the database and its media to backups/<date>. The folder appears only when complete. */
export async function createBackup(client: Client, database: string, storage: FileStorage, suffix = '') {
	const createdAt = new Date();
	const name = createdAt.toISOString().replace(/\.\d+Z$/, 'Z').replace(/:/g, '-') + suffix;
	const dir = join(BACKUPS_DIR, name);
	const partial = `${dir}.partial`;
	await mkdir(partial, { recursive: true });

	const snapshot = await readSnapshot(client);
	const file = openBackupFile(partial);
	try {
		await copyDatabase(snapshot, file);
		const check = await file.execute('PRAGMA integrity_check');
		if (check.rows[0]?.integrity_check !== 'ok') throw new Error('The database copy failed its integrity check.');
		const copied = await readSnapshot(file);
		if (JSON.stringify(copied.tables) !== JSON.stringify(snapshot.tables)) throw new Error('The database copy differs from the original.');
	} finally {
		file.close();
	}

	const media: MediaEntry[] = [];
	const missingMedia: string[] = [];
	const keys = mediaKeys(snapshot, storage.publicUrl(''));
	for (const [i, key] of keys.entries()) {
		process.stdout.write(`\rMedia ${i + 1}/${keys.length}`);
		const path = mediaPath(partial, key);
		try {
			const bytes = await readStored(storage, key);
			await mkdir(dirname(path), { recursive: true });
			await writeFile(path, bytes);
			media.push({ key, bytes: bytes.length, sha256: sha256(bytes) });
		} catch (error) {
			missingMedia.push(key);
			console.warn(`\n  ! ${key}: ${error instanceof Error ? error.message : error}`);
		}
	}
	if (keys.length > 0) process.stdout.write('\n');

	const manifest: Manifest = {
		version: 1,
		createdAt: createdAt.toISOString(),
		database,
		rows: Object.fromEntries(snapshot.tables.map((t) => [t.name, t.rows.length])),
		media,
		missingMedia,
	};
	await writeFile(join(partial, MANIFEST_FILE), JSON.stringify(manifest, null, 2));
	await rename(partial, dir);
	return { name, manifest };
}

export function summary(manifest: Manifest): string {
	const rows = Object.values(manifest.rows).reduce((a, b) => a + b, 0);
	const mb = manifest.media.reduce((a, m) => a + m.bytes, 0) / 1024 / 1024;
	return `${Object.keys(manifest.rows).length} tables, ${rows} rows, ${manifest.media.length} files (${mb.toFixed(1)} MB)`;
}
