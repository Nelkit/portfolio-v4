export const BASE_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';

export function mediaUrl(url: string | null | undefined): string {
	if (!url) return '';
	if (url.startsWith('http')) return url;
	return `${BASE_URL}${url}`;
}