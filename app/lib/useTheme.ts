'use client';

import { useSyncExternalStore } from 'react';

type Theme = 'plum' | 'light';

// The theme lives on <html data-theme> (set by the inline <head> script or the
// home page's ClientWrapper). Reading it as an external store keeps every
// component in sync without copying it into state. Used by pages outside the
// home (blog/projects) that don't have ClientWrapper's theme state.
function subscribe(onChange: () => void) {
	const observer = new MutationObserver(onChange);
	observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
	return () => observer.disconnect();
}

const readTheme = (): Theme => (document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'plum');

export function useTheme() {
	// Server render: the default theme (the inline script fixes it before paint).
	const theme = useSyncExternalStore(subscribe, readTheme, (): Theme => 'plum');

	const toggleTheme = () => {
		const next: Theme = theme === 'light' ? 'plum' : 'light';
		document.documentElement.setAttribute('data-theme', next);
		try {
			localStorage.setItem('portfolio-theme', next);
		} catch {}
	};

	return { theme, toggleTheme };
}
