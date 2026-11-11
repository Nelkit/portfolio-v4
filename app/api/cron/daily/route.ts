import { NextResponse } from 'next/server';
import { getDb } from '@/app/lib/db/client';
import { backupKey, dumpDatabase, isAuthorizedCron } from '@/app/lib/backup/backup';
import { getBackupStorage } from '@/app/lib/storage/storage';

// Always run on request (never prerendered or cached).
export const dynamic = 'force-dynamic';

/**
 * Daily job (vercel.json → crons):
 * 1. Reads every table — keeps the Turso Free database active (it is archived
 *    after ~10 days without activity) and produces the backup.
 * 2. Stores the JSON dump in the PRIVATE backup bucket, one file per UTC day.
 */
export async function GET(request: Request) {
	if (!isAuthorizedCron(request.headers.get('authorization'), process.env.CRON_SECRET)) {
		return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
	}

	const dump = await dumpDatabase(getDb());
	const rows = Object.fromEntries(Object.entries(dump.tables).map(([name, list]) => [name, list.length]));

	const storage = getBackupStorage();
	if (!storage) {
		return NextResponse.json({ keepAlive: true, backup: 'skipped: R2_BACKUP_BUCKET not configured', rows });
	}
	const key = backupKey();
	await storage.put(key, new TextEncoder().encode(JSON.stringify(dump)), 'application/json');
	return NextResponse.json({ keepAlive: true, backup: key, rows });
}
