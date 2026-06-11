import { BASE_URL } from "@/app/lib/constant";

// Retry a few times on transient errors (503s from Strapi Cloud cold starts)
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 600;

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function getStrapiData(url: string, revalidate = 86400) {
    // In development, always fetch fresh — no caching, so new CMS content
    // shows up immediately without clearing .next/cache.
    const fetchOptions: RequestInit =
        process.env.NODE_ENV === 'development'
            ? { cache: 'no-store' }
            : { next: { revalidate } };

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
        try {
            const response = await fetch(`${BASE_URL}${url}`, fetchOptions);

            if (response.ok) {
                return await response.json();
            }

            // 404 / 4xx — a valid "no data" answer; do not retry, do not throw.
            if (response.status < 500) {
                console.error(`Strapi fetch failed: ${response.status} ${response.statusText} — ${url}`);
                return null;
            }

            // 5xx — transient. Retry; if all attempts fail, throw so Next.js
            // does NOT cache a broken (empty) page and will retry next request.
            console.error(`Strapi ${response.status} (attempt ${attempt}/${MAX_RETRIES}) — ${url}`);
            if (attempt === MAX_RETRIES) {
                throw new Error(`Strapi unavailable after ${MAX_RETRIES} attempts: ${response.status}`);
            }
        } catch (e) {
            if (attempt === MAX_RETRIES) {
                console.error('Strapi fetch error (final):', e);
                throw e;
            }
            console.error(`Strapi fetch error (attempt ${attempt}/${MAX_RETRIES}):`, e);
        }
        await sleep(RETRY_DELAY_MS * attempt);
    }
    return null;
}