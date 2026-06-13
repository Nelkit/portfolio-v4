'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { NavDrawer, type NavItem } from '@/app/components/NavDrawer';
import { useTheme } from '@/app/lib/useTheme';
import { trackEvent } from '@/app/lib/analytics';

const NAV_ITEMS: NavItem[] = [
	{ id: 'work', label: 'Work' },
	{ id: 'stack', label: 'Stack' },
	{ id: 'career', label: 'Career' },
	{ id: 'education', label: 'Education' },
	{ id: 'writing', label: 'Writing' },
	{ id: 'contact', label: 'Contact' },
];

const IMenu = () => (
	<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
		<path d="M4 6h16M4 12h16M4 18h16" />
	</svg>
);

export function SiteTopbar({ resumeUrl }: { resumeUrl?: string }) {
	const [open, setOpen] = useState(false);
	const { theme, toggleTheme } = useTheme();

	return (
		<>
			<header className="proj-topbar">
				<div className="proj-topbar-inner">
					<Link href="/" className="proj-topbar-brand">
						<Image src="/img/logo.webp" alt="Nelkit Chavez" width={36} height={36} className="proj-topbar-logo" />
						<span className="proj-topbar-name">Nelkit Chavez</span>
					</Link>
					<button className="fn-hamburger" onClick={() => setOpen(true)} aria-label="Menu">
						<IMenu />
					</button>
				</div>
			</header>

			{open && (
				<NavDrawer
					items={NAV_ITEMS}
					onClose={() => setOpen(false)}
					theme={theme}
					onToggleTheme={toggleTheme}
					resumeUrl={resumeUrl}
					renderItem={(n, i) => (
						<Link key={n.id} href={`/#${n.id}`}
							className="fn-drawer-item"
							onClick={() => setOpen(false)}>
							<span className="fn-drawer-num">{String(i + 1).padStart(2, '0')}</span>
							{n.label}
						</Link>
					)}
					renderCta={() => (
						<Link href="/#contact" className="btn btn-accent fn-drawer-cta"
							onClick={() => { trackEvent('contact_cta_clicked', { location: 'drawer' }); setOpen(false); }}>
							Get in touch
						</Link>
					)}
				/>
			)}
		</>
	);
}
