import type { Metadata, Viewport } from "next";
import { Space_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";

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

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Nelkit Chavez — Software/ML/AI Engineer',
    template: '%s · Nelkit Chavez',
  },
  description: 'Seven years shipping production mobile apps. Now building products that think, with ML, LLMs, and the instinct to ship that only comes from doing it for real.',
  keywords: ['ML Engineer', 'AI Engineer', 'Mobile Engineer', 'Swift', 'Flutter', 'React Native', 'Python', 'CoreML', 'LLM', 'Sydney'],
  authors: [{ name: 'Nelkit Chavez', url: SITE_URL }],
  creator: 'Nelkit Chavez',
  openGraph: {
    type: 'website',
    url: SITE_URL,
    siteName: 'Nelkit Chavez',
    title: 'Nelkit Chavez — Software/ML/AI Engineer',
    description: 'Seven years shipping production mobile apps. Now building products that think, with ML, LLMs, and the instinct to ship that only comes from doing it for real.',
    images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: 'Nelkit Chavez — Software/ML/AI Engineer' }],
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Nelkit Chavez — Software/ML/AI Engineer',
    description: 'Seven years shipping production mobile apps. Now building products that think, with ML, LLMs, and the instinct to ship that only comes from doing it for real.',
    images: [OG_IMAGE],
    creator: '@nelkitchavez',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large' },
  },
  alternates: { canonical: SITE_URL },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-theme="plum" data-skin="terminal">
      <body className={`${spaceGrotesk.variable} ${jetbrainsMono.variable}`}
            style={{ fontFamily: "var(--font-space-grotesk, var(--font-sans))" }}>
        {children}
      </body>
    </html>
  );
}
