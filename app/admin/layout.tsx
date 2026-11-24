import type { Metadata } from 'next';
import { Space_Grotesk, JetBrains_Mono } from 'next/font/google';
import '../globals.css';
import { ToastProvider } from './components/ui/Toaster';

// Same fonts as the public site.
const spaceGrotesk = Space_Grotesk({ variable: '--font-space-grotesk', subsets: ['latin'], weight: ['400', '500', '600', '700'] });
const jetbrainsMono = JetBrains_Mono({ variable: '--font-jetbrains-mono', subsets: ['latin'], weight: ['400', '500', '700'] });

export const metadata: Metadata = {
	title: 'Admin',
	robots: { index: false, follow: false },
};

// Root layout for the admin (separate from the public [locale] root layout).
// data-theme="plum" gives it the public site's palette (see globals.css).
export default function AdminLayout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en" data-theme="plum">
			<body className={`${spaceGrotesk.variable} ${jetbrainsMono.variable}`}>
				<div className="min-h-screen text-ui-text font-mono">
					<ToastProvider>
						<div className="mx-auto max-w-6xl px-4 py-10">{children}</div>
					</ToastProvider>
				</div>
			</body>
		</html>
	);
}
