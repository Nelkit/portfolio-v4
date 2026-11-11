import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

/** Port: limits login attempts per identifier (e.g. `login:<ip>`). */
export interface RateLimiter {
	attempt(identifier: string): Promise<{ allowed: boolean; retryAfterSeconds: number }>;
}

/** Login policy: at most this many attempts per IP in the window. */
export const LOGIN_ATTEMPTS = 5;
export const LOGIN_WINDOW_MS = 15 * 60 * 1000;

/**
 * Fixed-window limiter in process memory. Fine for development and as a
 * fallback, but NOT shared between serverless instances — use Upstash in production.
 */
export function createMemoryRateLimiter({
	limit,
	windowMs,
	now = Date.now,
}: {
	limit: number;
	windowMs: number;
	now?: () => number;
}): RateLimiter {
	const windows = new Map<string, { start: number; count: number }>();
	return {
		async attempt(identifier) {
			const t = now();
			const current = windows.get(identifier);
			const window = current && t - current.start < windowMs ? current : { start: t, count: 0 };
			window.count += 1;
			windows.set(identifier, window);
			const allowed = window.count <= limit;
			return { allowed, retryAfterSeconds: allowed ? 0 : Math.ceil((window.start + windowMs - t) / 1000) };
		},
	};
}

function createUpstashRateLimiter(url: string, token: string): RateLimiter {
	const ratelimit = new Ratelimit({
		redis: new Redis({ url, token }),
		limiter: Ratelimit.slidingWindow(LOGIN_ATTEMPTS, `${LOGIN_WINDOW_MS / 60_000} m`),
		prefix: 'portfolio:ratelimit',
	});
	return {
		async attempt(identifier) {
			const { success, reset } = await ratelimit.limit(identifier);
			return { allowed: success, retryAfterSeconds: success ? 0 : Math.max(1, Math.ceil((reset - Date.now()) / 1000)) };
		},
	};
}

let loginLimiter: RateLimiter | undefined;

/**
 * Upstash when configured (UPSTASH_REDIS_REST_URL/TOKEN, or the KV_REST_API_*
 * names the Vercel integration sets); otherwise the in-memory fallback.
 */
export function getLoginRateLimiter(): RateLimiter {
	if (!loginLimiter) {
		const url = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
		const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;
		if (url && token) loginLimiter = createUpstashRateLimiter(url, token);
		else {
			if (process.env.NODE_ENV === 'production') {
				console.warn('Login rate limiting uses process memory: set UPSTASH_REDIS_REST_URL/TOKEN to share it across instances.');
			}
			loginLimiter = createMemoryRateLimiter({ limit: LOGIN_ATTEMPTS, windowMs: LOGIN_WINDOW_MS });
		}
	}
	return loginLimiter;
}

/** Client IP: first x-forwarded-for entry (set by Vercel), then x-real-ip. */
export function clientIp(headers: Headers): string {
	const forwarded = headers.get('x-forwarded-for')?.split(',')[0]?.trim();
	return forwarded || headers.get('x-real-ip')?.trim() || 'unknown';
}
