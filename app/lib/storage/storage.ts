import { randomBytes } from 'node:crypto';
import { mkdir, rm, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { AwsClient } from 'aws4fetch';

/** Port: where uploaded files live. Keys look like `profile/avatar-ab12cd34.webp`. */
export interface FileStorage {
	put(key: string, bytes: Uint8Array, contentType: string): Promise<void>;
	delete(key: string): Promise<void>;
	publicUrl(key: string): string;
}

const SAFE_KEY = /^[a-z0-9][a-z0-9_-]*(\/[a-z0-9][a-z0-9_-]*)*\.[a-z0-9]+$/;

function assertSafeKey(key: string) {
	if (!SAFE_KEY.test(key)) throw new Error(`Unsafe storage key: ${key}`);
}

/** Unique key per upload, so a replaced file never hits a stale CDN/browser cache. */
export function buildKey(prefix: string, ext: string): string {
	const id = randomBytes(6).toString('base64url').toLowerCase().replace(/[^a-z0-9]/g, '0').slice(0, 8);
	const key = `${prefix}-${id}.${ext}`;
	assertSafeKey(key);
	return key;
}

// ---------- Local disk (development only; Vercel's filesystem is read-only) ----------

export function createLocalStorage({ rootDir, urlPrefix }: { rootDir: string; urlPrefix: string }): FileStorage {
	return {
		async put(key, bytes) {
			assertSafeKey(key);
			const path = join(rootDir, key);
			await mkdir(dirname(path), { recursive: true });
			await writeFile(path, bytes);
		},
		async delete(key) {
			assertSafeKey(key);
			await rm(join(rootDir, key), { force: true });
		},
		publicUrl: (key) => `${urlPrefix}/${key}`,
	};
}

// ---------- Cloudflare R2 (S3-compatible API, signed with SigV4) ----------

export type R2Config = {
	accountId: string;
	accessKeyId: string;
	secretAccessKey: string;
	bucket: string;
	/** Public base URL of the bucket (custom domain), e.g. https://media.nelkit.dev */
	publicUrl: string;
	/**
	 * Bucket jurisdiction (dashboard → bucket → "Jurisdiction"). Buckets created
	 * with an explicit jurisdiction live on their own S3 endpoint
	 * (<account>.us.r2… / .eu. / .fedramp.); the default endpoint answers
	 * NoSuchBucket for them. Omit for buckets without a jurisdiction.
	 */
	jurisdiction?: 'us' | 'eu' | 'fedramp';
};

export const R2_JURISDICTIONS = ['us', 'eu', 'fedramp'] as const;

export function createR2Storage(config: R2Config): FileStorage {
	const client = new AwsClient({
		accessKeyId: config.accessKeyId,
		secretAccessKey: config.secretAccessKey,
		service: 's3',
		region: 'auto',
	});
	const host = `${config.accountId}${config.jurisdiction ? `.${config.jurisdiction}` : ''}.r2.cloudflarestorage.com`;
	const objectUrl = (key: string) => `https://${host}/${config.bucket}/${key}`;
	const publicBase = config.publicUrl.replace(/\/+$/, '');

	const send = async (key: string, init: RequestInit) => {
		assertSafeKey(key);
		const response = await client.fetch(objectUrl(key), init);
		if (!response.ok && response.status !== 404) {
			// R2 explains failures in an S3 XML body (<Code>AccessDenied</Code>, SignatureDoesNotMatch…).
			const code = /<Code>([^<]+)<\/Code>/.exec(await response.text().catch(() => ''))?.[1];
			const hint = code === 'AccessDenied' ? ' — check the API token permission (Object Read & Write) and its bucket scope' : '';
			throw new Error(`R2 ${init.method} ${key} failed: ${response.status}${code ? ` ${code}` : ''}${hint}`);
		}
	};

	return {
		put: (key, bytes, contentType) =>
			send(key, {
				method: 'PUT',
				body: bytes as BodyInit,
				headers: { 'content-type': contentType, 'cache-control': 'public, max-age=31536000, immutable' },
			}),
		delete: (key) => send(key, { method: 'DELETE' }),
		publicUrl: (key) => `${publicBase}/${key}`,
	};
}

// ---------- Selection by environment ----------

function r2ConfigFromEnv(): R2Config | null {
	const config = {
		accountId: process.env.R2_ACCOUNT_ID,
		accessKeyId: process.env.R2_ACCESS_KEY_ID,
		secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
		bucket: process.env.R2_BUCKET,
		publicUrl: process.env.R2_PUBLIC_URL,
	};
	if (!Object.values(config).every(Boolean)) return null;
	const raw = process.env.R2_JURISDICTION?.trim().toLowerCase() || undefined;
	const jurisdiction = R2_JURISDICTIONS.find((j) => j === raw);
	if (raw && !jurisdiction) throw new Error(`R2_JURISDICTION must be one of: ${R2_JURISDICTIONS.join(', ')} (got "${raw}")`);
	return { ...(config as Omit<R2Config, 'jurisdiction'>), jurisdiction };
}

/** R2 when configured; local disk in development; otherwise uploads fail loudly. */
export function getStorage(): FileStorage {
	const r2 = r2ConfigFromEnv();
	if (r2) return createR2Storage(r2);
	if (process.env.NODE_ENV === 'production') {
		throw new Error('File storage is not configured: set the R2_* environment variables.');
	}
	return createLocalStorage({ rootDir: join(process.cwd(), 'public', 'uploads'), urlPrefix: '/uploads' });
}

/**
 * PRIVATE bucket for database backups (R2_BACKUP_BUCKET), reusing the R2
 * credentials. Must NOT be the public media bucket: backups include drafts.
 * Returns null when not configured (the cron then skips the backup).
 */
export function getBackupStorage(): FileStorage | null {
	const bucket = process.env.R2_BACKUP_BUCKET?.trim();
	const r2 = r2ConfigFromEnv();
	if (!bucket || !r2) return null;
	if (bucket === r2.bucket) throw new Error('R2_BACKUP_BUCKET must be a private bucket, not the public media bucket.');
	return createR2Storage({ ...r2, bucket });
}

/** Public base URL of stored files: the R2 public domain, or local /uploads in development. */
export function uploadBaseUrl(): string {
	return process.env.R2_PUBLIC_URL?.replace(/\/+$/, '') || '/uploads';
}

/** Public URL of a stored key, without requiring write credentials. */
export function publicUrlFor(key: string): string {
	return `${uploadBaseUrl()}/${key}`;
}
