'use client';

import { ISun, IMoon, IDown } from '@/app/components/icons';
import { trackEvent } from '@/app/lib/analytics';
import { LanguageSwitch } from '@/app/components/LanguageSwitch';
import { useI18n } from '@/app/lib/i18n/I18nProvider';

const IClose = () => (
	<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
		<path d="M18 6 6 18M6 6l12 12" />
	</svg>
);

/** Section anchors shared by every nav (labels come from the dictionary). */
export const NAV_IDS = ['work', 'stack', 'career', 'education', 'writing', 'contact'] as const;

export type NavItem = { id: string; label: string };

type NavDrawerProps = {
	items: NavItem[];
	onClose: () => void;
	// Renders a single nav row. Lets the host decide between in-page scroll (home)
	// or cross-page Link navigation (blog/projects).
	renderItem: (item: NavItem, index: number) => React.ReactNode;
	// Renders the primary CTA ("Get in touch") — same reason as above.
	renderCta: () => React.ReactNode;
	theme: 'plum' | 'light';
	onToggleTheme: () => void;
	resumeUrl?: string;
};

// Shared drawer used by both the home floating nav and the blog/projects topbar.
// Centralizes the head + nav + footer (theme toggle, Get in touch, Download CV).
export function NavDrawer({ items, onClose, renderItem, renderCta, theme, onToggleTheme, resumeUrl }: NavDrawerProps) {
	const { t } = useI18n();
	return (
		<div className="fn-drawer-overlay" onClick={onClose}>
			<div className="fn-drawer" onClick={(e) => e.stopPropagation()}>
				<div className="fn-drawer-head">
					<span className="fn-drawer-label">{t.common.navigate}</span>
					<button className="fn-drawer-close" onClick={onClose}><IClose /></button>
				</div>

				<nav className="fn-drawer-nav">
					{items.map((item, i) => renderItem(item, i))}
				</nav>

				<div className="fn-drawer-foot">
					<button className="theme-toggle" onClick={onToggleTheme} aria-label={t.common.toggleTheme}>
						{theme === 'light' ? <IMoon /> : <ISun />}
					</button>
					<LanguageSwitch className="theme-toggle lang-toggle" />
					<div className="fn-drawer-actions">
						{renderCta()}
						{resumeUrl && (
							<a className="btn btn-outline fn-drawer-cv" href={resumeUrl}
							   target="_blank" rel="noopener noreferrer"
							   onClick={() => { trackEvent('cv_downloaded'); onClose(); }}>
								<IDown /> {t.common.downloadCv}
							</a>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}
