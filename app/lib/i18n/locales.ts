export const LOCALES = ['en', 'es'] as const;
export type Locale = (typeof LOCALES)[number];

/** Used when neither the visitor's choice nor the browser language is supported. */
export const DEFAULT_LOCALE: Locale = 'en';
