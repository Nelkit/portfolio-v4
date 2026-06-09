import { BASE_URL } from "@/app/lib/constant";

export async function getStrapiData(url: string, revalidate = 86400) {
    try {
        const response = await fetch(`${BASE_URL}${url}`, {
            next: { revalidate },
        });
        if (!response.ok) {
            console.error(`Strapi fetch failed: ${response.status} ${response.statusText} — ${url}`);
            return null;
        }
        return await response.json();
    } catch (e) {
        console.error('Strapi fetch error:', e);
        return null;
    }
}