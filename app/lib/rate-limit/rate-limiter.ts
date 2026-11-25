import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

export type RateLimitResult = { allowed: boolean; retryAfterSeconds: number };

/** Port: limits attempts per identifier (e.g. `login:<ip>`). */
export interface RateLimiter {
	attempt(identifier: string): Promise<RateLimitResult>;
}

export type RateLimitPolicy = { name: string; limit: number; windowMs: number };

/**
 * Fixed-window limiter in process memory. Fine for development and as a
 * fallback, but NOT shared between serverless instances — use Upstash in production.
 */
export function createMemoryRateLimiter({
	limit,
	windowMs,
	now = Date.now,
	maxEntries = 5_000,
}: {
	limit: number;
	windowMs: number;
	now?: () => number;
	/** Expired windows are dropped when this many identifiers are stored. */
	maxEntries?: number;
}): RateLimiter & { size(): number } {
	const windows = new Map<string, { start: number; count: number }>();
	return {
		size: () => windows.size,
		async attempt(identifier) {
			const t = now();
			if (windows.size >= maxEntries && !windows.has(identifier)) {
				for (const [key, w] of windows) if (t - w.start >= windowMs) windows.delete(key);
				// Still full: drop the oldest entry.
				const oldest = windows.keys().next();
				if (windows.size >= maxEntries && !oldest.done) windows.delete(oldest.value);
			}
			const current = windows.get(identifier);
			const window = current && t - current.start < windowMs ? current : { start: t, count: 0 };
			window.count += 1;
			windows.set(identifier, window);
			const allowed = window.count <= limit;
			return { allowed, retryAfterSeconds: allowed ? 0 : Math.ceil((window.start + windowMs - t) / 1000) };
		},
	};
}

/** Uses `fallback` whenever `primary` fails (service down, quota used up). */
export function withFallback(primary: RateLimiter, fallback: RateLimiter): RateLimiter {
	return {
		async attempt(identifier) {
			try {
				return await primary.attempt(identifier);
			} catch (error) {
				console.warn('Rate limiter failed, using process memory:', error instanceof Error ? error.message : error);
				return fallback.attempt(identifier);
			}
		},
	};
}

function createUpstashRateLimiter(url: string, token: string, { name, limit, windowMs }: RateLimitPolicy): RateLimiter {
	const ratelimit = new Ratelimit({
		redis: new Redis({ url, token, retry: { retries: 1 } }),
		limiter: Ratelimit.fixedWindow(limit, `${windowMs} ms`),
		prefix: `portfolio:ratelimit:${name}`,
		// Blocked identifiers are remembered here, so they cost no Redis commands.
		ephemeralCache: new Map(),
		timeout: 1_500,
	});
	return {
		async attempt(identifier) {
			const { success, reset, reason } = await ratelimit.limit(identifier);
			// On timeout the library lets everything through: treat it as a failure.
			if (reason === 'timeout') throw new Error('Upstash timed out');
			return { allowed: success, retryAfterSeconds: success ? 0 : Math.max(1, Math.ceil((reset - Date.now()) / 1000)) };
		},
	};
}

/**
 * Upstash when configured (UPSTASH_REDIS_REST_URL/TOKEN, or the KV_REST_API_*
 * names the Vercel integration sets), backed by memory; otherwise only memory.
 */
export function createRateLimiter(policy: RateLimitPolicy): RateLimiter {
	const memory = createMemoryRateLimiter(policy);
	const url = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
	const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;
	if (url && token) return withFallback(createUpstashRateLimiter(url, token, policy), memory);
	if (process.env.NODE_ENV === 'production') {
		console.warn(`Rate limit "${policy.name}" uses process memory: set UPSTASH_REDIS_REST_URL/TOKEN to share it across instances.`);
	}
	return memory;
}

/** Client IP: first x-forwarded-for entry (set by Vercel), then x-real-ip. */
export function clientIp(headers: Headers): string {
	const forwarded = headers.get('x-forwarded-for')?.split(',')[0]?.trim();
	return forwarded || headers.get('x-real-ip')?.trim() || 'unknown';
}
