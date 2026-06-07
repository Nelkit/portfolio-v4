'use client';

const ISun = () => (
	<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
		<circle cx="12" cy="12" r="4"/>
		<path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5M17.5 17.5 19 19M19 5l-1.5 1.5M6.5 17.5 5 19"/>
	</svg>
);
const IMoon = () => (
	<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
		<path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z"/>
	</svg>
);

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
				<span className="mark">nc</span>
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
