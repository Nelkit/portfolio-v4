import Image from 'next/image';
import Link from 'next/link';
import { getStrapiData } from '@/app/lib/strapi';
import qs from 'qs';
import { IGithub, ILinkedin } from '@/app/components/icons';

async function fetchSocialLinks() {
	const query = qs.stringify({
		populate: { socialNetworkLinks: '*' },
		fields: ['id'],
	}, { encodeValuesOnly: true });
	const data = await getStrapiData(`/api/home-page?${query}`);
	return data?.data?.socialNetworkLinks ?? [];
}

export default async function ProjectsLayout({ children }: { children: React.ReactNode }) {
	const socialLinks: any[] = await fetchSocialLinks();

	const github   = socialLinks.find((l) => l.type === 'github')?.href   || 'https://github.com/nelkit';
	const linkedin = socialLinks.find((l) => l.type === 'linkedin')?.href || 'https://linkedin.com/in/nelkit';
	const email    = socialLinks.find((l) => l.type === 'email')?.href    || 'mailto:hello@nelkit.dev';

	return (
		<>
			{/* Top bar */}
			<header className="proj-topbar">
				<div className="proj-topbar-inner">
					<Link href="/" className="proj-topbar-brand">
						<Image src="/img/logo.webp" alt="Nelkit Chavez" width={36} height={36} className="proj-topbar-logo" />
						<span className="proj-topbar-name">Nelkit Chavez</span>
					</Link>
					<nav className="proj-topbar-nav">
						<a className="soc" href={github} target="_blank" rel="noreferrer" aria-label="GitHub"><IGithub /></a>
						<a className="soc" href={linkedin} target="_blank" rel="noreferrer" aria-label="LinkedIn"><ILinkedin /></a>
					</nav>
				</div>
			</header>

			{children}

			{/* Footer */}
			<div className="wrap">
				<footer className="proj-simple-footer">
					<div className="foot-row">
						<span className="c">© 2026 Nelkit Chavez · Built in Sydney</span>
						<div className="links">
							<a href={github} target="_blank" rel="noreferrer">GitHub</a>
							<a href={linkedin} target="_blank" rel="noreferrer">LinkedIn</a>
							<a href={email}>Email</a>
						</div>
					</div>
				</footer>
			</div>
		</>
	);
}
