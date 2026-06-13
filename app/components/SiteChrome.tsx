import { cache } from 'react';
import { getStrapiData } from '@/app/lib/strapi';
import { mediaUrl } from '@/app/lib/constant';
import qs from 'qs';
import { SiteTopbar } from '@/app/components/SiteTopbar';
import { FooterButtons } from '@/app/components/FooterButtons';

type SocialLink = { type: string; href: string };

const fetchChromeData = cache(async (): Promise<{ links: SocialLink[]; resumeUrl?: string }> => {
	const query = qs.stringify(
		{ populate: { socialNetworkLinks: '*', resume: { fields: ['url'] } }, fields: ['id'] },
		{ encodeValuesOnly: true },
	);
	const data = await getStrapiData(`/api/home-page?${query}`);
	return {
		links: data?.data?.socialNetworkLinks ?? [],
		resumeUrl: mediaUrl(data?.data?.resume?.url) || undefined,
	};
});

function resolveLinks(links: SocialLink[]) {
	return {
		github: links.find((l) => l.type === 'github')?.href || 'https://github.com/nelkit',
		linkedin: links.find((l) => l.type === 'linkedin')?.href || 'https://linkedin.com/in/nelkit',
		email: links.find((l) => l.type === 'email')?.href || 'mailto:hello@nelkit.dev',
	};
}

// Shared top bar + footer used by the /blog and /projects layouts.
// The home page uses its own MainNav (which hosts the AI chat), so it's excluded.
export async function SiteChrome({ children }: { children: React.ReactNode }) {
	const { links, resumeUrl } = await fetchChromeData();
	const { github, linkedin, email } = resolveLinks(links);

	return (
		<>
			<SiteTopbar resumeUrl={resumeUrl} />

			{children}

			<div className="wrap">
				<footer className="proj-simple-footer">
					<div className="foot-row">
						<span className="c">© 2026 Nelkit Chavez · Built in Sydney</span>
						<FooterButtons github={github} linkedin={linkedin} emailHref={email} />
					</div>
				</footer>
			</div>
		</>
	);
}
