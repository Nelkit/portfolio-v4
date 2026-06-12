'use client';

import { useEffect, useState } from 'react';

type Theme = 'plum' | 'light';

// Reads the theme already applied to <html> (by the inline <head> script or the
// home page's ClientWrapper) and lets any component toggle it. Used by pages
// outside the home (blog/projects) that don't have ClientWrapper's theme state.
export function useTheme() {
	const [theme, setThemeState] = useState<Theme>('plum');

	useEffect(() => {
		const applied = document.documentElement.getAttribute('data-theme');
		if (applied === 'plum' || applied === 'light') setThemeState(applied);
	}, []);

	const toggleTheme = () => {
		const next: Theme = theme === 'light' ? 'plum' : 'light';
		setThemeState(next);
		document.documentElement.setAttribute('data-theme', next);
		try {
			localStorage.setItem('portfolio-theme', next);
		} catch {}
	};

	return { theme, toggleTheme };
}
