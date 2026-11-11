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
};

export function createR2Storage(config: R2Config): FileStorage {
	const client = new AwsClient({
		accessKeyId: config.accessKeyId,
		secretAccessKey: config.secretAccessKey,
		service: 's3',
		region: 'auto',
	});
	const objectUrl = (key: string) =>
		`https://${config.accountId}.r2.cloudflarestorage.com/${config.bucket}/${key}`;
	const publicBase = config.publicUrl.replace(/\/+$/, '');

	const send = async (key: string, init: RequestInit) => {
		assertSafeKey(key);
		const response = await client.fetch(objectUrl(key), init);
		if (!response.ok && response.status !== 404) {
			throw new Error(`R2 ${init.method} ${key} failed: ${response.status}`);
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
	return Object.values(config).every(Boolean) ? (config as R2Config) : null;
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

/** Public URL of a stored key, without requiring write credentials. */
export function publicUrlFor(key: string): string {
	const base = process.env.R2_PUBLIC_URL;
	return base ? `${base.replace(/\/+$/, '')}/${key}` : `/uploads/${key}`;
}
