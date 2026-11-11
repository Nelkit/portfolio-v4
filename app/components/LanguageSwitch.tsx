'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useI18n } from '@/app/lib/i18n/I18nProvider';
import { LOCALES } from '@/app/lib/i18n/locales';
import { LOCALE_COOKIE, switchLocalePath } from '@/app/lib/i18n/routing';

const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365;

// Links to the same page in the other language and remembers the choice in a
// cookie, so later visits to unprefixed URLs (e.g. "/") land in this language.
export function LanguageSwitch({ className = 'soc lang-toggle' }: { className?: string }) {
	const { locale, t } = useI18n();
	const pathname = usePathname();
	const target = LOCALES.find((l) => l !== locale) ?? locale;

	const remember = () => {
		document.cookie = `${LOCALE_COOKIE}=${target}; path=/; max-age=${ONE_YEAR_SECONDS}; samesite=lax`;
	};

	return (
		<Link
			href={switchLocalePath(pathname, target)}
			className={className}
			hrefLang={target}
			aria-label={t.common.languageSwitch.aria}
			onClick={remember}
		>
			{t.common.languageSwitch.label}
		</Link>
	);
}
