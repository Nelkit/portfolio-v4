import { afterEach, describe, expect, it, vi } from 'vitest';

// Strapi is being retired: pages must keep rendering (with those sections
// empty) when it is not configured or no longer reachable.
async function load(url: string | undefined) {
	vi.resetModules();
	vi.stubEnv('NEXT_PUBLIC_STRAPI_URL', url ?? '');
	return import('./strapi');
}

describe('getStrapiData', () => {
	afterEach(() => {
		vi.unstubAllEnvs();
		vi.unstubAllGlobals();
	});

	it('returns null without calling the network when Strapi is not configured', async () => {
		const fetchMock = vi.fn();
		vi.stubGlobal('fetch', fetchMock);
		const { getStrapiData } = await load(undefined);
		expect(await getStrapiData('/api/home-page')).toBeNull();
		expect(fetchMock).not.toHaveBeenCalled();
	});

	it('returns null instead of throwing when Strapi is unreachable', async () => {
		vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('fetch failed')));
		const { getStrapiData } = await load('https://dead.strapiapp.com');
		await expect(getStrapiData('/api/home-page')).resolves.toBeNull();
	}, 10_000);

	it('returns the JSON body when Strapi answers', async () => {
		vi.stubGlobal('fetch', vi.fn().mockResolvedValue(Response.json({ data: { ok: true } })));
		const { getStrapiData } = await load('https://cms.example.com');
		expect(await getStrapiData('/api/home-page')).toEqual({ data: { ok: true } });
	});
});
