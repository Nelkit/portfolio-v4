import { describe, expect, it, vi } from 'vitest';
import { createMemoryRateLimiter, withFallback, type RateLimiter } from './rate-limiter';

const down: RateLimiter = { attempt: async () => { throw new Error('quota exceeded'); } };

describe('withFallback', () => {
	it('uses the primary while it works', async () => {
		const primary = { attempt: vi.fn(async () => ({ allowed: false, retryAfterSeconds: 7 })) };
		const fallback = { attempt: vi.fn(async () => ({ allowed: true, retryAfterSeconds: 0 })) };
		expect(await withFallback(primary, fallback).attempt('a')).toEqual({ allowed: false, retryAfterSeconds: 7 });
		expect(fallback.attempt).not.toHaveBeenCalled();
	});

	it('keeps limiting in memory when the primary fails, instead of throwing', async () => {
		const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
		const limiter = withFallback(down, createMemoryRateLimiter({ limit: 1, windowMs: 1000, now: () => 0 }));
		expect((await limiter.attempt('a')).allowed).toBe(true);
		expect((await limiter.attempt('a')).allowed).toBe(false);
		warn.mockRestore();
	});
});

describe('createMemoryRateLimiter', () => {
	it('forgets expired identifiers, so memory does not grow forever', async () => {
		let now = 0;
		const limiter = createMemoryRateLimiter({ limit: 1, windowMs: 1000, now: () => now, maxEntries: 2 });
		await limiter.attempt('a');
		await limiter.attempt('b');
		now = 2000;
		await limiter.attempt('c');
		expect(limiter.size()).toBe(1);
	});
});
