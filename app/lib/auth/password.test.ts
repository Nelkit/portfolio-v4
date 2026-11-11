import { describe, expect, it } from 'vitest';
import { hashPassword, verifyPassword } from './password';

describe('password hashing', () => {
	it('verifies the original password against its hash', async () => {
		const hash = await hashPassword('correct horse battery staple');
		expect(await verifyPassword('correct horse battery staple', hash)).toBe(true);
	});

	it('rejects a wrong password', async () => {
		const hash = await hashPassword('correct horse battery staple');
		expect(await verifyPassword('wrong password', hash)).toBe(false);
	});

	it('produces a different hash each time (random salt)', async () => {
		const a = await hashPassword('same');
		const b = await hashPassword('same');
		expect(a).not.toBe(b);
	});

	it('uses no "$" so the hash survives dotenv variable expansion', async () => {
		const hash = await hashPassword('anything');
		expect(hash).not.toContain('$');
		expect(hash.startsWith('scrypt:')).toBe(true);
	});

	it('returns false for a malformed stored hash instead of throwing', async () => {
		expect(await verifyPassword('x', '')).toBe(false);
		expect(await verifyPassword('x', 'not-a-hash')).toBe(false);
		expect(await verifyPassword('x', 'scrypt:only-salt')).toBe(false);
	});
});
