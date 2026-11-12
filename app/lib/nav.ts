/**
 * Home sections in display order. Single source for every nav (hero menu, top bar,
 * drawer) and for the "01".."06" numbers in the section titles, so they cannot drift.
 * Plain module (no 'use client'): server components can import its values.
 */
export const NAV_IDS = ['work', 'stack', 'career', 'education', 'writing', 'contact'] as const;

export type NavId = (typeof NAV_IDS)[number];

/** "01".."06": position of the section in the nav. */
export const navNumber = (id: NavId): string => String(NAV_IDS.indexOf(id) + 1).padStart(2, '0');
