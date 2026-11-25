/**
 * Local copy of the database and the media it uses, in backups/<date>/ (git-ignored).
 *
 *   pnpm backup
 *
 * Only reads: changes nothing in Turso or R2.
 */
import { createBackup, openDatabase, summary } from './common';

async function main() {
	const { getStorage } = await import('@/app/lib/storage/storage');
	const { client, label } = openDatabase();
	console.log(`Database: ${label}`);
	const { name, manifest } = await createBackup(client, label, getStorage());
	console.log(`Saved backups/${name}: ${summary(manifest)}`);
	if (manifest.missingMedia.length > 0) {
		console.error(`INCOMPLETE: ${manifest.missingMedia.length} media files could not be downloaded (listed above and in manifest.json).`);
		process.exitCode = 1;
	}
}

main().catch((error) => {
	console.error(error instanceof Error ? error.message : error);
	process.exitCode = 1;
});
