/** Legacy Strapi CMS (being retired). Empty → Strapi is disabled. */
export const BASE_URL = process.env.NEXT_PUBLIC_STRAPI_URL || '';

export function mediaUrl(url: string | null | undefined): string {
	if (!url) return '';
	if (url.startsWith('http')) return url;
	return `${BASE_URL}${url}`;
}