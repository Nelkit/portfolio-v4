import { createRateLimiter, type RateLimiter } from '@/app/lib/rate-limit/rate-limiter';

/** Login policy: at most this many attempts per IP in the window. */
export const LOGIN_ATTEMPTS = 5;
export const LOGIN_WINDOW_MS = 15 * 60 * 1000;

let loginLimiter: RateLimiter | undefined;

export function getLoginRateLimiter(): RateLimiter {
	return (loginLimiter ??= createRateLimiter({ name: 'login', limit: LOGIN_ATTEMPTS, windowMs: LOGIN_WINDOW_MS }));
}
