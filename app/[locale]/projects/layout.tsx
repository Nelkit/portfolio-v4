import { SiteChrome } from '@/app/components/SiteChrome';
import { resolveLocale } from '@/app/lib/i18n/server';

export default async function ProjectsLayout({
	children,
	params,
}: {
	children: React.ReactNode;
	params: Promise<{ locale: string }>;
}) {
	const { locale } = await resolveLocale(params);
	return <SiteChrome locale={locale}>{children}</SiteChrome>;
}
