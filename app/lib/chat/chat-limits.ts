import { createHmac } from 'node:crypto';
import { createRateLimiter, type RateLimiter } from '@/app/lib/rate-limit/rate-limiter';

const DAY_MS = 24 * 60 * 60 * 1000;

/** Per visitor: 8 messages a minute and 40 a day. Everyone together: 300 a day. */
export const CHAT_POLICIES = {
	minute: { name: 'chat-minute', limit: 8, windowMs: 60_000 },
	day: { name: 'chat-day', limit: 40, windowMs: DAY_MS },
	global: { name: 'chat-global', limit: 300, windowMs: DAY_MS },
} as const;

export type ChatLimitCode = keyof typeof CHAT_POLICIES;
export type ChatLimiters = Record<ChatLimitCode, RateLimiter>;

let limiters: ChatLimiters | undefined;

export function getChatLimiters(): ChatLimiters {
	return (limiters ??= {
		minute: createRateLimiter(CHAT_POLICIES.minute),
		day: createRateLimiter(CHAT_POLICIES.day),
		global: createRateLimiter(CHAT_POLICIES.global),
	});
}

/** Counters identify visitors by a keyed hash, so IP addresses are never stored. */
export function chatClientId(ip: string, secret: string): string {
	return createHmac('sha256', secret).update(ip).digest('hex').slice(0, 32);
}

/**
 * Returns the first limit reached, or null. Runs in order and stops early: a
 * blocked visitor uses neither more commands nor the budget shared by everyone.
 */
export async function checkChatLimits(
	clientId: string,
	{ minute, day, global }: ChatLimiters,
): Promise<{ code: ChatLimitCode; retryAfterSeconds: number } | null> {
	const checks: [ChatLimitCode, RateLimiter, string][] = [
		['minute', minute, clientId],
		['day', day, clientId],
		['global', global, 'all'],
	];
	for (const [code, limiter, id] of checks) {
		const { allowed, retryAfterSeconds } = await limiter.attempt(id);
		if (!allowed) return { code, retryAfterSeconds };
	}
	return null;
}
