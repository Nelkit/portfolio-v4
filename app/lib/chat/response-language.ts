import { DEFAULT_LOCALE, type Locale } from '@/app/lib/i18n/locales';
import { isLocale } from '@/app/lib/i18n/routing';

const LANGUAGE: Record<Locale, string> = { en: 'English', es: 'Spanish' };

/**
 * Prompt rule: answer in the language of the site. `locale` comes from the
 * request, so anything that is not a supported locale becomes the default and
 * never reaches the prompt.
 */
export function responseLanguageRule(locale: unknown): string {
	const language = LANGUAGE[isLocale(locale) ? locale : DEFAULT_LOCALE];
	return `ALWAYS answer in ${language}, the language of the site the user is on. This applies even if the knowledge base, earlier messages or the question are in another language. Switch only if the user explicitly asks you to answer in another language.`;
}
