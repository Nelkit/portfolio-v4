import { afterEach, describe, expect, it, vi } from 'vitest';

const unstableCache = vi.fn<(fn: unknown, keyParts: string[], options: { tags: string[] }) => unknown>((fn) => fn);
vi.mock('next/cache', () => ({
	unstable_cache: (fn: unknown, keyParts: string[], options: { tags: string[] }) => unstableCache(fn, keyParts, options),
}));

async function load(env: Record<string, string | undefined>) {
	vi.resetModules();
	unstableCache.mockClear();
	for (const [key, value] of Object.entries(env)) vi.stubEnv(key, value ?? '');
	return import('./cached-read');
}

describe('cachedRead', () => {
	afterEach(() => vi.unstubAllEnvs());

	it('does not cache in development (code changes must never serve stale shapes)', async () => {
		const { cachedRead } = await load({ NODE_ENV: 'development' });
		const fn = vi.fn(async (x: number) => x * 2);
		const read = cachedRead(fn, ['projects'], ['projects']);
		expect(await read(2)).toBe(4);
		expect(unstableCache).not.toHaveBeenCalled();
	});

	it('in production, keys the cache by deployment so a new deploy never reads entries of the old code', async () => {
		const { cachedRead } = await load({ NODE_ENV: 'production', VERCEL_DEPLOYMENT_ID: 'dpl_123' });
		cachedRead(async () => 1, ['projects'], ['projects', 'areas']);
		expect(unstableCache).toHaveBeenCalledWith(expect.any(Function), ['projects', 'dpl_123'], { tags: ['projects', 'areas'] });
	});

	it('falls back to the git commit, then to a fixed version, outside Vercel deployments', async () => {
		let mod = await load({ NODE_ENV: 'production', VERCEL_DEPLOYMENT_ID: undefined, VERCEL_GIT_COMMIT_SHA: 'abc123' });
		mod.cachedRead(async () => 1, ['posts'], ['posts']);
		expect(unstableCache.mock.calls[0][1]).toEqual(['posts', 'abc123']);

		mod = await load({ NODE_ENV: 'production', VERCEL_DEPLOYMENT_ID: undefined, VERCEL_GIT_COMMIT_SHA: undefined });
		mod.cachedRead(async () => 1, ['posts'], ['posts']);
		expect(unstableCache.mock.calls[0][1]).toEqual(['posts', 'local']);
	});
});
