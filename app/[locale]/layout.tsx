import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import { Space_Grotesk, JetBrains_Mono } from "next/font/google";
import { GoogleAnalytics } from "@next/third-parties/google";
import { LOCALES } from "@/app/lib/i18n/locales";
import { isLocale } from "@/app/lib/i18n/routing";
import { getDictionary } from "@/app/lib/i18n/dictionaries";
import { I18nProvider } from "@/app/lib/i18n/I18nProvider";
import "../globals.css";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

const SITE_URL = 'https://nelkit.dev';
const OG_IMAGE = `${SITE_URL}/img/og-image.jpg`;

type LayoutProps = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

// One static variant of the whole site per language.
export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: Omit<LayoutProps, 'children'>): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const t = getDictionary(locale).meta;
  const url = `${SITE_URL}/${locale}`;

  return {
    metadataBase: new URL(SITE_URL),
    title: { default: t.siteTitle, template: '%s · Nelkit Chavez' },
    description: t.siteDescription,
    keywords: ['ML Engineer', 'AI Engineer', 'Mobile Engineer', 'Swift', 'Flutter', 'React Native', 'Python', 'CoreML', 'LLM', 'Sydney'],
    authors: [{ name: 'Nelkit Chavez', url: SITE_URL }],
    creator: 'Nelkit Chavez',
    openGraph: {
      type: 'website',
      url,
      siteName: 'Nelkit Chavez',
      title: t.siteTitle,
      description: t.siteDescription,
      images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: t.siteTitle }],
      locale: t.ogLocale,
    },
    twitter: {
      card: 'summary_large_image',
      title: t.siteTitle,
      description: t.siteDescription,
      images: [OG_IMAGE],
      creator: '@nelkitchavez',
    },
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true, 'max-image-preview': 'large' },
    },
    alternates: {
      canonical: url,
      languages: Object.fromEntries(LOCALES.map((l) => [l, `${SITE_URL}/${l}`])),
    },
  };
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

// Root layout of the public site (the admin has its own root layout), so
// <html lang> matches the language of the page.
export default async function LocaleLayout({ children, params }: LayoutProps) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  // Runs before first paint to set the theme — prevents a flash of the wrong
  // theme. Priority: saved user choice > OS preference > 'plum'.
  const themeScript = `(function(){try{var s=localStorage.getItem('portfolio-theme');var t=(s==='plum'||s==='light')?s:(window.matchMedia('(prefers-color-scheme: light)').matches?'light':'plum');document.documentElement.setAttribute('data-theme',t);}catch(e){}})();`;

  const gaId = process.env.NEXT_PUBLIC_GA_ID;

  return (
    <html lang={locale} data-theme="plum" data-skin="terminal" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className={`${spaceGrotesk.variable} ${jetbrainsMono.variable}`}
            style={{ fontFamily: "var(--font-space-grotesk, var(--font-sans))" }}>
        <I18nProvider locale={locale}>{children}</I18nProvider>
      </body>
      {gaId && <GoogleAnalytics gaId={gaId} />}
    </html>
  );
}
