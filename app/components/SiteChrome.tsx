import { SiteTopbar } from '@/app/components/SiteTopbar';
import { FooterButtons } from '@/app/components/FooterButtons';
import { getDictionary } from '@/app/lib/i18n/dictionaries';
import type { Locale } from '@/app/lib/i18n/locales';
import { getPublishedProfile } from '@/app/lib/content/profile/profile-service';

type SocialLink = { type: string; href: string };

function resolveLinks(links: SocialLink[]) {
	return {
		github: links.find((l) => l.type === 'github')?.href || 'https://github.com/nelkit',
		linkedin: links.find((l) => l.type === 'linkedin')?.href || 'https://linkedin.com/in/nelkit',
		email: links.find((l) => l.type === 'email')?.href || 'mailto:hello@nelkit.dev',
	};
}

// Shared top bar + footer used by the /blog and /projects layouts.
// The home page uses its own MainNav (which hosts the AI chat), so it's excluded.
export async function SiteChrome({ locale, children }: { locale: Locale; children: React.ReactNode }) {
	const t = getDictionary(locale);
	const profile = await getPublishedProfile(locale);
	const links: SocialLink[] = profile?.links.map((l) => ({ type: l.type, href: l.url })) ?? [];
	const resumeUrl = profile?.cvUrl ?? undefined;
	const { github, linkedin, email } = resolveLinks(links);

	return (
		<>
			<SiteTopbar resumeUrl={resumeUrl} />

			{children}

			<div className="wrap">
				<footer className="proj-simple-footer">
					<div className="foot-row">
						<span className="c">© 2026 Nelkit Chavez · {t.common.builtIn}</span>
						<FooterButtons github={github} linkedin={linkedin} emailHref={email} />
					</div>
				</footer>
			</div>
		</>
	);
}
