'use client';

import Image from "next/image";
import { ISun, IMoon } from '@/app/components/icons';
import { NavDrawer } from '@/app/components/NavDrawer';
import { trackEvent } from '@/app/lib/analytics';

const NAV_ITEMS = [
	{ id: 'work',      label: 'Work' },
	{ id: 'stack',     label: 'Stack' },
	{ id: 'career',    label: 'Career' },
	{ id: 'education', label: 'Education' },
	{ id: 'writing',   label: 'Writing' },
	{ id: 'contact',   label: 'Contact' },
];

const IMenu = () => (
	<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
		<path d="M4 6h16M4 12h16M4 18h16"/>
	</svg>
);

const IClose = () => (
	<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
		<path d="M18 6 6 18M6 6l12 12"/>
	</svg>
);

type MainNavProps = {
	show: boolean;
	theme: 'plum' | 'light';
	onToggleTheme: () => void;
	onNav: (id: string) => void;
	open: boolean;
	setOpen: (open: boolean) => void;
	resumeUrl?: string;
};

export function MainNav({ show, theme, onToggleTheme, onNav, open, setOpen, resumeUrl }: MainNavProps) {
	const handleNav = (id: string) => {
		onNav(id);
		setOpen(false);
	};

	return (
		<>
			<nav className={'floating-nav' + (show ? ' show' : '')}>
				<a className="fn-brand" href="#top" onClick={(e) => { e.preventDefault(); handleNav('top'); }}>
					<Image src="/img/logo.webp" alt="Nelkit Chavez Logo" width={80} height={80} className="mark" />
					<b>Nelkit Chavez</b>
				</a>

				{/* Desktop links */}
				<div className="fn-links">
					{NAV_ITEMS.map((n) => (
						<a key={n.id} href={'#' + n.id}
						   onClick={(e) => { e.preventDefault(); handleNav(n.id); }}>
							{n.label}
						</a>
					))}
					<button className="theme-toggle" onClick={onToggleTheme} aria-label="Toggle theme">
						{theme === 'light' ? <IMoon /> : <ISun />}
					</button>
					<a className="fn-cta" href="#contact"
					   onClick={(e) => { e.preventDefault(); handleNav('contact'); }}>
						Get in touch
					</a>
				</div>

				{/* Mobile hamburger */}
				<button className="fn-hamburger" onClick={() => setOpen(!open)} aria-label="Menu">
					{open ? <IClose /> : <IMenu />}
				</button>
			</nav>

			{/* Drawer */}
			{open && (
				<NavDrawer
					items={NAV_ITEMS}
					onClose={() => setOpen(false)}
					theme={theme}
					onToggleTheme={onToggleTheme}
					resumeUrl={resumeUrl}
					renderItem={(n, i) => (
						<a key={n.id} href={'#' + n.id}
						   className="fn-drawer-item"
						   onClick={(e) => { e.preventDefault(); handleNav(n.id); }}>
							<span className="fn-drawer-num">{String(i + 1).padStart(2, '0')}</span>
							{n.label}
						</a>
					)}
					renderCta={() => (
						<a className="btn btn-accent fn-drawer-cta" href="#contact"
						   onClick={(e) => { e.preventDefault(); trackEvent('contact_cta_clicked', { location: 'drawer' }); handleNav('contact'); }}>
							Get in touch
						</a>
					)}
				/>
			)}
		</>
	);
}
