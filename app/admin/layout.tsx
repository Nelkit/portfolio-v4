import type { Metadata } from 'next';
import '../globals.css';

export const metadata: Metadata = {
	title: 'Admin',
	robots: { index: false, follow: false },
};

// Root layout for the admin (separate from the public [locale] root layout).
export default function AdminLayout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en">
			<body>
				<div className="min-h-screen bg-zinc-950 text-zinc-100 font-mono">
					<div className="mx-auto max-w-6xl px-4 py-10">{children}</div>
				</div>
			</body>
		</html>
	);
}
