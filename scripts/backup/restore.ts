/**
 * Restores a backup made by `pnpm backup` into the database and storage of .env.
 *
 *   pnpm backup:restore                        → lists the backups
 *   pnpm backup:restore <name|latest>            → dry run (checks and prints the changes)
 *   pnpm backup:restore <name|latest> --confirm  → saves the current state, then restores
 *
 * REPLACES every row of the tables in the backup (one atomic batch). Media:
 * uploads what is missing or different and never deletes a file.
 */
import { readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { extname, join } from 'node:path';
import {
	BACKUPS_DIR, createBackup, listBackups, MANIFEST_FILE, mediaPath, openBackupFile, openDatabase,
	readStored, sha256, summary, type Manifest, type MediaEntry,
} from './common';
import { checkTarget, migrationHashes, readSnapshot, restoreSnapshot } from './database-copy';

const CONTENT_TYPES: Record<string, string> = {
	'.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.gif': 'image/gif',
	'.svg': 'image/svg+xml', '.avif': 'image/avif', '.pdf': 'application/pdf', '.mp4': 'video/mp4', '.webm': 'video/webm',
};

async function main() {
	const args = process.argv.slice(2).filter((a) => a !== '--');
	const confirm = args.includes('--confirm');
	const requested = args.find((a) => !a.startsWith('--'));
	const backups = listBackups();
	if (!requested) {
		console.log(backups.length > 0 ? backups.join('\n') : 'No backups yet. Run pnpm backup.');
		return;
	}
	// "latest" skips the safety copies that a restore makes.
	const name = requested === 'latest' ? backups.filter((b) => !b.endsWith('-before-restore')).at(-1) : requested;
	if (!name || !backups.includes(name)) throw new Error(`No backup "${requested}". Run pnpm backup:restore to list them.`);

	const { getStorage } = await import('@/app/lib/storage/storage');
	const storage = getStorage();
	const dir = join(BACKUPS_DIR, name);
	const manifest: Manifest = JSON.parse(await readFile(join(dir, MANIFEST_FILE), 'utf8'));
	const { client, label } = openDatabase();
	console.log(`Backup:   ${name} (from ${manifest.database}): ${summary(manifest)}`);
	console.log(`Restores: ${label}\n`);

	// ---- Checks: nothing is written until all of them pass ----
	const file = openBackupFile(dir);
	const snapshot = await readSnapshot(file);
	file.close();
	for (const table of snapshot.tables) {
		if (table.rows.length !== manifest.rows[table.name]) throw new Error(`The backup is damaged: ${table.name} does not match its manifest.`);
	}
	for (const { key, sha256: expected } of manifest.media) {
		const path = mediaPath(dir, key);
		if (!existsSync(path) || sha256(await readFile(path)) !== expected) throw new Error(`The backup is damaged: media/${key}`);
	}
	await checkTarget(snapshot, client);
	const current = await readSnapshot(client);

	if (migrationHashes(current).join() !== migrationHashes(snapshot).join()) {
		console.warn('! The database has different migrations than the backup. New columns get their default; review the content after restoring.');
	}
	for (const table of current.tables) {
		if (manifest.rows[table.name] === undefined) console.warn(`! Table ${table.name} is not in the backup: it will be left as it is.`);
	}
	if (manifest.missingMedia.length > 0) console.warn(`! The backup lacks ${manifest.missingMedia.length} media files.`);

	let changed = 0;
	for (const table of snapshot.tables) {
		if (table.name.startsWith('__')) continue;
		const now = current.tables.find((t) => t.name === table.name);
		if (JSON.stringify(now?.rows) === JSON.stringify(table.rows) && now?.columns.join() === table.columns.join()) continue;
		changed += 1;
		console.log(`  ${table.name}: ${now?.rows.length ?? 0} → ${table.rows.length} rows`);
	}
	if (changed === 0) console.log('  Database: already identical');

	const uploads: MediaEntry[] = [];
	for (const entry of manifest.media) {
		const same = await readStored(storage, entry.key).then((bytes) => sha256(bytes) === entry.sha256, () => false);
		if (!same) uploads.push(entry);
	}
	console.log(`  Media: ${uploads.length} to upload, ${manifest.media.length - uploads.length} already identical`);
	for (const { key } of uploads) console.log(`    + ${key}`);

	if (!confirm) {
		console.log('\nDry run: nothing was changed. Add --confirm to restore.');
		return;
	}

	// ---- Restore ----
	const safety = await createBackup(client, label, storage, '-before-restore');
	console.log(`\nCurrent state saved in backups/${safety.name}`);
	// Media first: if an upload fails, the database is still untouched.
	for (const { key } of uploads) {
		await storage.put(key, await readFile(mediaPath(dir, key)), CONTENT_TYPES[extname(key).toLowerCase()] ?? 'application/octet-stream');
	}
	await restoreSnapshot(snapshot, client);
	console.log('Restored. The deployed site may show cached content until you redeploy.');
}

main().catch((error) => {
	console.error(error instanceof Error ? error.message : error);
	process.exitCode = 1;
});
