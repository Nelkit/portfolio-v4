import { IMail } from '@/app/components/icons';

type LinkItem = { label: string; href: string; type: string; isExternal?: boolean };

type FooterSectionProps = {
	socialNetworkLinks?: LinkItem[];
	onNav: (id: string) => void;
};

const FALLBACK_LINKS = [
	{ label: 'github.com/nelkit',       href: 'https://github.com/nelkit',  type: 'github',   tag: 'GitHub' },
	{ label: 'linkedin.com/in/nelkit',  href: 'https://linkedin.com/in/nelkit', type: 'linkedin', tag: 'LinkedIn' },
	{ label: 'Download CV (PDF)',        href: '#',                          type: 'cv',       tag: '2026' },
];

export function FooterSection({ socialNetworkLinks, onNav }: FooterSectionProps) {
	const emailLink = socialNetworkLinks?.find((l) => l.type === 'email');
	const emailHref = emailLink?.href || 'mailto:hello@nelkit.dev';
	const emailLabel = emailLink?.label || 'hello@nelkit.dev';

	const linkRows =
		socialNetworkLinks && socialNetworkLinks.length > 0
			? socialNetworkLinks
				.filter((l) => l.type !== 'email')
				.map((l) => ({
					label: l.href.replace(/^https?:\/\//, ''),
					href: l.href,
					type: l.type,
					tag: l.type.charAt(0).toUpperCase() + l.type.slice(1),
				}))
			: FALLBACK_LINKS;

	return (
		<section id="contact" className="section">
			<div className="contact">
				<div>
					<span className="available">
						<i className="sq" /> Available 2026 · [ conf: 0.97 ]
					</span>
					<h2>Let's build something <em>that ships.</em></h2>
					<p className="lede">
						Open to senior IC roles in mobile, ML engineering, or anywhere those two intersect. Remote, hybrid, or Sydney in person.
					</p>
					<a className="btn btn-accent"
					   style={{ display: 'inline-flex', width: 'auto', padding: '0 20px' }}
					   href={emailHref}>
						<IMail /> {emailLabel}
					</a>
				</div>

				<div className="link-list">
					{linkRows.map((l) => (
						<a key={l.type} className="link-row" href={l.href}
						   target={l.type !== 'cv' ? '_blank' : undefined}
						   rel={l.type !== 'cv' ? 'noopener noreferrer' : undefined}
						   onClick={l.href === '#' ? (e) => e.preventDefault() : undefined}>
							<span className="arr">→</span>
							<span className="u">{l.label}</span>
							<span className="k">{l.tag}</span>
						</a>
					))}
				</div>
			</div>

			<footer>
				<div className="foot-row">
					<span className="c">© 2026 Nelkit Chavez · Built in Sydney</span>
					<div className="links">
						<a href={linkRows.find((l) => l.type === 'github')?.href || 'https://github.com/nelkit'}
						   target="_blank" rel="noreferrer">GitHub</a>
						<a href={linkRows.find((l) => l.type === 'linkedin')?.href || 'https://linkedin.com/in/nelkit'}
						   target="_blank" rel="noreferrer">LinkedIn</a>
						<a href={emailHref}>Email</a>
					</div>
				</div>
			</footer>
		</section>
	);
}
