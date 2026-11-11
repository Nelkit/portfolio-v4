import { FooterButtons, ContactCta } from '@/app/components/FooterButtons';
import { useI18n } from '@/app/lib/i18n/I18nProvider';

type CtaLink = { label: string; href: string; isExternal?: boolean; type?: string };

type RichTextChild = { text?: string };
type RichTextBlock = { children?: RichTextChild[] };

type CtaSection = {
	available?: string;
	header?: RichTextBlock[] | string;
	description?: string;
	email?: string;
	links?: CtaLink[];
};

type FooterSectionProps = {
	socialNetworkLinks?: { label: string; href: string; type: string; isExternal?: boolean }[];
	ctaSection?: CtaSection;
	onNav: (id: string) => void;
};

function parseHeader(header: RichTextBlock[] | string | undefined, fallback: string): { before: string; em: string; after: string } {
	const fromCms = !header
		? ''
		: Array.isArray(header)
			? header.map((b) => b.children?.map((c) => c.text || '').join('')).join('')
			: String(header);
	const text = fromCms || fallback;
	// extract <em>...</em>
	const match = text.match(/^(.*?)<em>(.*?)<\/em>(.*)$/s);
	if (match) return { before: match[1], em: match[2], after: match[3] };
	return { before: text, em: '', after: '' };
}

export function FooterSection({ socialNetworkLinks, ctaSection }: FooterSectionProps) {
	const { t } = useI18n();
	const copy = t.sections.contact;
	const available = ctaSection?.available || copy.available;
	const description = ctaSection?.description || copy.description;
	const email = ctaSection?.email || socialNetworkLinks?.find((l) => l.type === 'email')?.href || 'hello@nelkit.dev';
	const emailHref = email.startsWith('mailto:') ? email : `mailto:${email}`;

	const { before, em, after } = parseHeader(ctaSection?.header, copy.headline);

	const ctaLinks: CtaLink[] = ctaSection?.links && ctaSection.links.length > 0
		? ctaSection.links
		: (socialNetworkLinks?.filter((l) => l.type !== 'email') ?? []);

	const github   = ctaLinks.find((l) => l.type === 'github')?.href   || socialNetworkLinks?.find((l) => l.type === 'github')?.href   || 'https://github.com/nelkit';
	const linkedin = ctaLinks.find((l) => l.type === 'linkedin')?.href || socialNetworkLinks?.find((l) => l.type === 'linkedin')?.href || 'https://linkedin.com/in/nelkit';

	return (
		<section id="contact" className="section">
			<div className="contact">
				<div>
					<span className="available">
						<i className="sq" /> {available}
					</span>
					<h2>
						{before}{em && <em>{em}</em>}{after}
					</h2>
					<p className="lede">{description}</p>
					<ContactCta emailHref={emailHref} />
				</div>

				<div className="link-list">
					{ctaLinks.map((l) => {
						const href = l.href?.startsWith('http') ? l.href : `https://${l.href}`;
						const display = l.href?.replace(/^https?:\/\//, '') || l.label;
						return (
							<a key={l.href} className="link-row" href={href}
							   target={l.isExternal ? '_blank' : undefined}
							   rel={l.isExternal ? 'noopener noreferrer' : undefined}>
								<span className="arr">→</span>
								<span className="u">{display}</span>
								<span className="k">{l.label}</span>
							</a>
						);
					})}
				</div>
			</div>

			<footer>
				<div className="foot-row">
					<span className="c">© {new Date().getFullYear()} Nelkit Chavez · {t.common.builtIn}</span>
					<FooterButtons
						github={github.startsWith('http') ? github : `https://${github}`}
						linkedin={linkedin.startsWith('http') ? linkedin : `https://${linkedin}`}
						emailHref={emailHref}
					/>
				</div>
			</footer>
		</section>
	);
}
