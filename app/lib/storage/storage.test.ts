import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { mkdtemp, readFile, rm, stat } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { buildKey, createLocalStorage, createR2Storage } from './storage';

describe('buildKey', () => {
	it('builds a unique, safe key with the extension', () => {
		const a = buildKey('profile/avatar', 'webp');
		const b = buildKey('profile/avatar', 'webp');
		expect(a).toMatch(/^profile\/avatar-[a-z0-9]{8}\.webp$/);
		expect(a).not.toBe(b);
	});
});

describe('local storage', () => {
	let dir: string;
	beforeEach(async () => {
		dir = await mkdtemp(join(tmpdir(), 'storage-test-'));
	});
	afterEach(async () => {
		await rm(dir, { recursive: true, force: true });
	});

	it('writes, serves and deletes a file', async () => {
		const storage = createLocalStorage({ rootDir: dir, urlPrefix: '/uploads' });
		await storage.put('profile/cv-abc.pdf', new TextEncoder().encode('%PDF'), 'application/pdf');

		expect(await readFile(join(dir, 'profile/cv-abc.pdf'), 'utf8')).toBe('%PDF');
		expect(storage.publicUrl('profile/cv-abc.pdf')).toBe('/uploads/profile/cv-abc.pdf');

		await storage.delete('profile/cv-abc.pdf');
		await expect(stat(join(dir, 'profile/cv-abc.pdf'))).rejects.toThrow();
	});

	it('refuses keys that could escape the upload folder', async () => {
		const storage = createLocalStorage({ rootDir: dir, urlPrefix: '/uploads' });
		await expect(storage.put('../evil.pdf', new Uint8Array(1), 'application/pdf')).rejects.toThrow();
		await expect(storage.delete('/etc/passwd')).rejects.toThrow();
	});

	it('ignores deleting a file that does not exist', async () => {
		const storage = createLocalStorage({ rootDir: dir, urlPrefix: '/uploads' });
		await expect(storage.delete('profile/missing-x.pdf')).resolves.toBeUndefined();
	});
});

describe('R2 storage', () => {
	afterEach(() => vi.unstubAllGlobals());

	const config = {
		accountId: 'acc123',
		accessKeyId: 'AKID',
		secretAccessKey: 'SECRET',
		bucket: 'portfolio',
		publicUrl: 'https://media.nelkit.dev/',
	};

	it('PUTs the object to the bucket with a signed request', async () => {
		const fetchMock = vi.fn().mockResolvedValue(new Response(null, { status: 200 }));
		vi.stubGlobal('fetch', fetchMock);

		await createR2Storage(config).put('profile/avatar-1.webp', new Uint8Array([1, 2]), 'image/webp');

		const request = fetchMock.mock.calls[0][0] as Request;
		expect(request.method).toBe('PUT');
		expect(request.url).toBe('https://acc123.r2.cloudflarestorage.com/portfolio/profile/avatar-1.webp');
		expect(request.headers.get('authorization')).toMatch(/^AWS4-HMAC-SHA256 Credential=AKID\//);
		expect(request.headers.get('content-type')).toBe('image/webp');
	});

	it('throws when R2 rejects the upload, including R2\'s error code', async () => {
		const xml = '<?xml version="1.0"?><Error><Code>AccessDenied</Code><Message>Access Denied</Message></Error>';
		vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(xml, { status: 403 })));
		await expect(createR2Storage(config).put('profile/a-1.png', new Uint8Array(1), 'image/png')).rejects.toThrow(
			/403 AccessDenied/,
		);
	});

	it('targets the jurisdiction endpoint when the bucket has one (US / EU / FedRAMP)', async () => {
		const fetchMock = vi.fn().mockResolvedValue(new Response(null, { status: 200 }));
		vi.stubGlobal('fetch', fetchMock);

		await createR2Storage({ ...config, jurisdiction: 'us' }).put('profile/a-1.png', new Uint8Array(1), 'image/png');
		await createR2Storage({ ...config, jurisdiction: 'eu' }).put('profile/a-1.png', new Uint8Array(1), 'image/png');

		expect((fetchMock.mock.calls[0][0] as Request).url).toBe('https://acc123.us.r2.cloudflarestorage.com/portfolio/profile/a-1.png');
		expect((fetchMock.mock.calls[1][0] as Request).url).toBe('https://acc123.eu.r2.cloudflarestorage.com/portfolio/profile/a-1.png');
	});

	it('builds public URLs from the configured public base', () => {
		expect(createR2Storage(config).publicUrl('profile/cv-1.pdf')).toBe('https://media.nelkit.dev/profile/cv-1.pdf');
	});
});
