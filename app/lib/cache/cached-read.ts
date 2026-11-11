import { unstable_cache } from 'next/cache';

/**
 * Identifies the running code. Cached values are shaped by the code that
 * produced them (e.g. a view type gaining a field), and the Vercel Data Cache
 * survives deployments — so the cache key must change with every deploy.
 */
const CODE_VERSION = process.env.VERCEL_DEPLOYMENT_ID || process.env.VERCEL_GIT_COMMIT_SHA || 'local';

/**
 * The only way content reads are cached. Invalidated by tag (updateTag) on
 * admin saves, and isolated per deployment. Not cached in development, so a
 * code change never serves data in an old shape.
 */
export function cachedRead<Args extends unknown[], Result>(
	fn: (...args: Args) => Promise<Result>,
	keyParts: string[],
	tags: string[],
): (...args: Args) => Promise<Result> {
	if (process.env.NODE_ENV === 'development') return fn;
	return unstable_cache(fn, [...keyParts, CODE_VERSION], { tags });
}
