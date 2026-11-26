/**
 * Remembers whether this visit has moved between pages of the site, so a
 * "Back" link can use the browser history (returning to the exact page and
 * scroll position) instead of a fixed URL. Lives in memory: a full reload or
 * a direct entry starts over, and the link then falls back to its href.
 */
import { getLocaleFromPathname } from '@/app/lib/i18n/routing';

/** The page without its language: '/es/projects/x' → '/projects/x' (a language switch is not a move). */
function pageOf(path: string): string {
	const locale = getLocaleFromPathname(path);
	return locale ? path.slice(locale.length + 1) || '/' : path;
}
export type InAppHistory = {
	visit(path: string): void;
	canGoBack(): boolean;
};

export function createInAppHistory(): InAppHistory {
	let current: string | null = null;
	let moved = false;
	return {
		visit(path) {
			const page = pageOf(path);
			if (current !== null && page !== current) moved = true;
			current = page;
		},
		canGoBack: () => moved,
	};
}

/** One per browser tab (client modules are evaluated once per page load). */
export const inAppHistory = createInAppHistory();
