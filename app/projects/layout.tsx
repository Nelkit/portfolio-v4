import Image from 'next/image';
import Link from 'next/link';
import { getStrapiData } from '@/app/lib/strapi';
import qs from 'qs';

const IGithub = () => <svg viewBox="0 0 24 24" fill="currentColor" width="17" height="17"><path d="M12 2C6.48 2 2 6.58 2 12.25c0 4.53 2.87 8.37 6.84 9.73.5.1.68-.22.68-.49 0-.24-.01-.88-.01-1.73-2.78.62-3.37-1.37-3.37-1.37-.45-1.18-1.11-1.49-1.11-1.49-.91-.64.07-.62.07-.62 1 .07 1.53 1.06 1.53 1.06.89 1.56 2.34 1.11 2.91.85.09-.66.35-1.11.63-1.37-2.22-.26-4.55-1.14-4.55-5.07 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.3.1-2.7 0 0 .84-.28 2.75 1.05A9.36 9.36 0 0 1 12 6.84c.85 0 1.71.12 2.51.34 1.91-1.33 2.75-1.05 2.75-1.05.55 1.4.2 2.44.1 2.7.64.72 1.03 1.63 1.03 2.75 0 3.94-2.34 4.81-4.57 5.06.36.32.68.94.68 1.9 0 1.37-.01 2.48-.01 2.82 0 .27.18.6.69.49A10.02 10.02 0 0 0 22 12.25C22 6.58 17.52 2 12 2Z"/></svg>;
const ILinkedin = () => <svg viewBox="0 0 24 24" fill="currentColor" width="17" height="17"><path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5ZM3 9h4v12H3V9Zm6 0h3.8v1.7h.05c.53-.95 1.83-1.95 3.77-1.95 4.03 0 4.78 2.5 4.78 5.75V21H17.5v-5.3c0-1.27-.02-2.9-1.77-2.9-1.77 0-2.04 1.38-2.04 2.8V21H9V9Z"/></svg>;

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
