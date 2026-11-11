import { BASE_URL } from "@/app/lib/constant";

// Retry a few times on transient errors (503s from Strapi Cloud cold starts)
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 600;
// Hard cap per attempt. A Strapi Cloud cold start can accept the connection but
// never respond — without this, fetch waits forever, the async Server Component
// never finishes rendering, and the page navigation hangs ("stuck thinking").
// Aborting lets the retry loop actually fire instead of blocking on one request.
const REQUEST_TIMEOUT_MS = 8000;

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * LEGACY: Strapi is being replaced by the admin (Turso). Sections not migrated
 * yet still read from it, so it must never break a page: when Strapi is not
 * configured or unreachable this returns null and those sections render empty.
 */
export async function getStrapiData(url: string, revalidate = 604800) {
    if (!BASE_URL) return null;

    // In development, always fetch fresh — no caching, so new CMS content
    // shows up immediately without clearing .next/cache.
    const fetchOptions: RequestInit =
        process.env.NODE_ENV === 'development'
            ? { cache: 'no-store' }
            : { next: { revalidate } };

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
        try {
            const response = await fetch(`${BASE_URL}${url}`, {
                ...fetchOptions,
                signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
            });

            if (response.ok) {
                return await response.json();
            }

            // 404 / 4xx — a valid "no data" answer; do not retry, do not throw.
            if (response.status < 500) {
                console.warn(`Strapi fetch failed: ${response.status} ${response.statusText} — ${url}`);
                return null;
            }

            // 5xx — transient. Retry; give up (null) after the last attempt.
            console.warn(`Strapi ${response.status} (attempt ${attempt}/${MAX_RETRIES}) — ${url}`);
            if (attempt === MAX_RETRIES) return null;
        } catch (e) {
            if (attempt === MAX_RETRIES) {
                console.warn(`Strapi unreachable, rendering without it — ${url}:`, (e as Error).message);
                return null;
            }
            console.warn(`Strapi fetch error (attempt ${attempt}/${MAX_RETRIES}): ${(e as Error).message}`);
        }
        await sleep(RETRY_DELAY_MS * attempt);
    }
    return null;
}