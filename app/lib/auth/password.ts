import { randomBytes, scrypt as scryptCb, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';

const scrypt = promisify(scryptCb) as (pw: string, salt: Buffer, len: number) => Promise<Buffer>;
const KEY_LENGTH = 64;

/**
 * Format: `scrypt:<salt>:<hash>` (base64url). No `$` on purpose — Next.js
 * expands `$VAR` inside .env files, which would corrupt bcrypt-style hashes.
 */
export async function hashPassword(password: string): Promise<string> {
	const salt = randomBytes(16);
	const hash = await scrypt(password, salt, KEY_LENGTH);
	return `scrypt:${salt.toString('base64url')}:${hash.toString('base64url')}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
	const [scheme, saltB64, hashB64] = stored.split(':');
	if (scheme !== 'scrypt' || !saltB64 || !hashB64) return false;

	const expected = Buffer.from(hashB64, 'base64url');
	if (expected.length !== KEY_LENGTH) return false;

	const actual = await scrypt(password, Buffer.from(saltB64, 'base64url'), KEY_LENGTH);
	return timingSafeEqual(actual, expected);
}
