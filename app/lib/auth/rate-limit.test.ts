import { describe, expect, it } from 'vitest';
import { clientIp, createMemoryRateLimiter } from './rate-limit';

describe('createMemoryRateLimiter', () => {
	it('allows up to the limit within the window, then blocks with a retry time', async () => {
		let now = 0;
		const limiter = createMemoryRateLimiter({ limit: 3, windowMs: 60_000, now: () => now });
		for (let i = 0; i < 3; i++) expect((await limiter.attempt('ip')).allowed).toBe(true);
		const blocked = await limiter.attempt('ip');
		expect(blocked.allowed).toBe(false);
		expect(blocked.retryAfterSeconds).toBe(60);

		now = 30_000;
		expect((await limiter.attempt('ip')).retryAfterSeconds).toBe(30);
	});

	it('lets attempts through again once the window has passed', async () => {
		let now = 0;
		const limiter = createMemoryRateLimiter({ limit: 1, windowMs: 1_000, now: () => now });
		expect((await limiter.attempt('ip')).allowed).toBe(true);
		expect((await limiter.attempt('ip')).allowed).toBe(false);
		now = 1_001;
		expect((await limiter.attempt('ip')).allowed).toBe(true);
	});

	it('counts each identifier separately', async () => {
		const limiter = createMemoryRateLimiter({ limit: 1, windowMs: 60_000, now: () => 0 });
		expect((await limiter.attempt('a')).allowed).toBe(true);
		expect((await limiter.attempt('b')).allowed).toBe(true);
		expect((await limiter.attempt('a')).allowed).toBe(false);
	});
});

describe('clientIp', () => {
	it('uses the first x-forwarded-for address (the client, as set by Vercel)', () => {
		expect(clientIp(new Headers({ 'x-forwarded-for': '203.0.113.7, 10.0.0.1' }))).toBe('203.0.113.7');
	});

	it('falls back to x-real-ip, then to a constant', () => {
		expect(clientIp(new Headers({ 'x-real-ip': '198.51.100.2' }))).toBe('198.51.100.2');
		expect(clientIp(new Headers())).toBe('unknown');
	});
});
