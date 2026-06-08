'use client';

import Image from "next/image";
import { ISun, IMoon } from '@/app/components/icons';

const NAV_ITEMS = [
	{ id: 'work',    label: 'Work' },
	{ id: 'stack',   label: 'Stack' },
	{ id: 'career',  label: 'Career' },
	{ id: 'writing', label: 'Writing' },
	{ id: 'contact', label: 'Contact' },
];

type MainNavProps = {
	show: boolean;
	theme: 'plum' | 'light';
	onToggleTheme: () => void;
	onNav: (id: string) => void;
};

export function MainNav({ show, theme, onToggleTheme, onNav }: MainNavProps) {
	return (
		<nav className={'floating-nav' + (show ? ' show' : '')}>
			<a className="fn-brand" href="#top" onClick={(e) => { e.preventDefault(); onNav('top'); }}>
				<Image src="/img/logo.webp" alt="Nelkit Chavez Logo" width={80} height={80} className="mark" />
				<b>Nelkit Chavez</b>
			</a>

			<div className="fn-links">
				{NAV_ITEMS.map((n) => (
					<a key={n.id} href={'#' + n.id}
					   onClick={(e) => { e.preventDefault(); onNav(n.id); }}>
						{n.label}
					</a>
				))}
				<button className="theme-toggle" onClick={onToggleTheme} aria-label="Toggle theme">
					{theme === 'light' ? <IMoon /> : <ISun />}
				</button>
				<a className="fn-cta" href="#contact"
				   onClick={(e) => { e.preventDefault(); onNav('contact'); }}>
					Get in touch
				</a>
			</div>
		</nav>
	);
}
