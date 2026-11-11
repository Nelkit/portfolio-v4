'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { NavDrawer, NAV_IDS } from '@/app/components/NavDrawer';
import { useI18n } from '@/app/lib/i18n/I18nProvider';
import { useTheme } from '@/app/lib/useTheme';
import { trackEvent } from '@/app/lib/analytics';


const IMenu = () => (
	<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
		<path d="M4 6h16M4 12h16M4 18h16" />
	</svg>
);

export function SiteTopbar({ resumeUrl }: { resumeUrl?: string }) {
	const [open, setOpen] = useState(false);
	const { theme, toggleTheme } = useTheme();
	const { t, href } = useI18n();
	const navItems = NAV_IDS.map((id) => ({ id, label: t.common.nav[id] }));

	return (
		<>
			<header className="proj-topbar">
				<div className="proj-topbar-inner">
					<Link href={href('/')} className="proj-topbar-brand">
						<Image src="/img/logo.webp" alt="Nelkit Chavez" width={36} height={36} className="proj-topbar-logo" />
						<span className="proj-topbar-name">Nelkit Chavez</span>
					</Link>
					<button className="fn-hamburger" onClick={() => setOpen(true)} aria-label={t.common.menu}>
						<IMenu />
					</button>
				</div>
			</header>

			{open && (
				<NavDrawer
					items={navItems}
					onClose={() => setOpen(false)}
					theme={theme}
					onToggleTheme={toggleTheme}
					resumeUrl={resumeUrl}
					renderItem={(n, i) => (
						<Link key={n.id} href={href(`/#${n.id}`)}
							className="fn-drawer-item"
							onClick={() => setOpen(false)}>
							<span className="fn-drawer-num">{String(i + 1).padStart(2, '0')}</span>
							{n.label}
						</Link>
					)}
					renderCta={() => (
						<Link href={href('/#contact')} className="btn btn-accent fn-drawer-cta"
							onClick={() => { trackEvent('contact_cta_clicked', { location: 'drawer' }); setOpen(false); }}>
							{t.common.getInTouch}
						</Link>
					)}
				/>
			)}
		</>
	);
}
