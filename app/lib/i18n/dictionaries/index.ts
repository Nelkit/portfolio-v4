import type { Locale } from '../locales';
import { en, type Dictionary } from './en';
import { es } from './es';

export type { Dictionary };

const dictionaries: Record<Locale, Dictionary> = { en, es };

/**
 * Both dictionaries are small (~a few KB) and contain functions (plurals),
 * so they are imported directly instead of being serialized server → client.
 */
export function getDictionary(locale: Locale): Dictionary {
	return dictionaries[locale];
}
