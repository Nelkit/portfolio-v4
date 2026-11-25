import { describe, expect, it, vi } from 'vitest';
import { createMemoryRateLimiter, type RateLimiter } from '@/app/lib/rate-limit/rate-limiter';
import { checkChatLimits, chatClientId } from './chat-limits';

const mem = (limit: number) => createMemoryRateLimiter({ limit, windowMs: 60_000, now: () => 0 });

describe('checkChatLimits', () => {
	it('allows until the per-minute limit', async () => {
		const limiters = { minute: mem(2), day: mem(10), global: mem(10) };
		expect(await checkChatLimits('a', limiters)).toBeNull();
		expect(await checkChatLimits('a', limiters)).toBeNull();
		expect(await checkChatLimits('a', limiters)).toEqual({ code: 'minute', retryAfterSeconds: 60 });
		expect(await checkChatLimits('b', limiters)).toBeNull();
	});

	it('reports the daily and the global limit', async () => {
		const day = { minute: mem(10), day: mem(1), global: mem(10) };
		await checkChatLimits('a', day);
		expect((await checkChatLimits('a', day))?.code).toBe('day');
		const global = { minute: mem(10), day: mem(10), global: mem(1) };
		await checkChatLimits('a', global);
		expect((await checkChatLimits('b', global))?.code).toBe('global');
	});

	it('stops at the first limit hit: a blocked visitor does not spend the global budget', async () => {
		const global: RateLimiter = { attempt: vi.fn(async () => ({ allowed: true, retryAfterSeconds: 0 })) };
		const limiters = { minute: mem(1), day: mem(10), global };
		await checkChatLimits('a', limiters);
		await checkChatLimits('a', limiters);
		expect(global.attempt).toHaveBeenCalledTimes(1);
	});
});

describe('chatClientId', () => {
	it('is stable per IP and does not contain it', () => {
		expect(chatClientId('203.0.113.7', 's')).toBe(chatClientId('203.0.113.7', 's'));
		expect(chatClientId('203.0.113.7', 's')).not.toBe(chatClientId('203.0.113.8', 's'));
		expect(chatClientId('203.0.113.7', 's')).not.toContain('203.0');
	});
});
