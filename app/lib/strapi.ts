import {BASE_URL} from "@/app/lib/constant";

export async function getStrapiData(url: string) {
    try {
        const response = await fetch(`${BASE_URL}${url}`)
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.statusText}`);
        }
        return await response.json();
    } catch (e) {
        console.error('Error fetching Strapi data:', e);
        return null;
    }
}