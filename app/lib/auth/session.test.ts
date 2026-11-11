import { describe, expect, it } from 'vitest';
import { SignJWT } from 'jose';
import { createSessionToken, verifySessionToken } from './session';

const SECRET = 'test-secret-that-is-at-least-32-characters-long';

describe('session token', () => {
	it('accepts a token it created', async () => {
		const token = await createSessionToken(SECRET);
		expect(await verifySessionToken(token, SECRET)).toBe(true);
	});

	it('rejects a token signed with another secret', async () => {
		const token = await createSessionToken('another-secret-that-is-also-32-chars-long!!');
		expect(await verifySessionToken(token, SECRET)).toBe(false);
	});

	it('rejects a tampered token', async () => {
		const token = await createSessionToken(SECRET);
		const tampered = token.slice(0, -2) + (token.endsWith('aa') ? 'bb' : 'aa');
		expect(await verifySessionToken(tampered, SECRET)).toBe(false);
	});

	it('rejects an expired token', async () => {
		const key = new TextEncoder().encode(SECRET);
		const expired = await new SignJWT({ role: 'admin' })
			.setProtectedHeader({ alg: 'HS256' })
			.setIssuedAt(Math.floor(Date.now() / 1000) - 7200)
			.setExpirationTime(Math.floor(Date.now() / 1000) - 3600)
			.sign(key);
		expect(await verifySessionToken(expired, SECRET)).toBe(false);
	});

	it('rejects a validly signed token without the admin role', async () => {
		const key = new TextEncoder().encode(SECRET);
		const notAdmin = await new SignJWT({ role: 'guest' })
			.setProtectedHeader({ alg: 'HS256' })
			.setExpirationTime('1h')
			.sign(key);
		expect(await verifySessionToken(notAdmin, SECRET)).toBe(false);
	});

	it('rejects missing token or missing secret', async () => {
		expect(await verifySessionToken(undefined, SECRET)).toBe(false);
		const token = await createSessionToken(SECRET);
		expect(await verifySessionToken(token, undefined)).toBe(false);
	});
});
