import type { Metadata } from 'next';
import { SiteChrome } from '@/app/components/SiteChrome';
import { resolveLocale } from '@/app/lib/i18n/server';

type Props = { children: React.ReactNode; params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Omit<Props, 'children'>): Promise<Metadata> {
	const { locale, t } = await resolveLocale(params);
	const url = `https://nelkit.dev/${locale}/blog`;
	return {
		title: t.meta.blogTitle,
		description: t.meta.blogDescription,
		alternates: { canonical: url },
		openGraph: {
			url,
			title: `${t.meta.blogTitle} · Nelkit Chavez`,
			description: t.meta.blogDescription,
		},
	};
}

export default async function BlogLayout({ children, params }: Props) {
	const { locale } = await resolveLocale(params);
	return <SiteChrome locale={locale}>{children}</SiteChrome>;
}
