import type { Metadata } from 'next';
import { SiteChrome } from '@/app/components/SiteChrome';

export const metadata: Metadata = {
  title: 'Writing',
  description: 'Articles on ML engineering, mobile development, and shipping AI products.',
  alternates: { canonical: 'https://nelkit.dev/blog' },
  openGraph: {
    url: 'https://nelkit.dev/blog',
    title: 'Writing · Nelkit Chavez',
    description: 'Articles on ML engineering, mobile development, and shipping AI products.',
  },
};

export default function BlogLayout({ children }: { children: React.ReactNode }) {
	return <SiteChrome>{children}</SiteChrome>;
}
