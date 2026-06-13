'use client';

import { IMail, IGithub, ILinkedin } from '@/app/components/icons';
import { trackEvent } from '@/app/lib/analytics';

type FooterButtonsProps = {
	github: string;
	linkedin: string;
	emailHref: string;
};

// The big "Get in touch" CTA (mailto) in the home footer. Tracked as a CTA click.
export function ContactCta({ emailHref }: { emailHref: string }) {
	return (
		<a className="btn btn-accent"
		   style={{ display: 'inline-flex', width: 'auto', padding: '0 20px' }}
		   href={emailHref}
		   onClick={() => trackEvent('contact_cta_clicked', { location: 'footer' })}>
			<IMail /> Get in touch
		</a>
	);
}

// Footer social/contact buttons with GA tracking. Client component so the
// onClick handlers can fire trackEvent; reused by home, blog and projects.
export function FooterButtons({ github, linkedin, emailHref }: FooterButtonsProps) {
	return (
		<div className="foot-btns">
			<a className="foot-btn" href={github} target="_blank" rel="noreferrer" aria-label="GitHub"
			   onClick={() => trackEvent('contact_clicked', { channel: 'github', location: 'footer' })}>
				<IGithub /> <span>GitHub</span>
			</a>
			<a className="foot-btn" href={linkedin} target="_blank" rel="noreferrer" aria-label="LinkedIn"
			   onClick={() => trackEvent('contact_clicked', { channel: 'linkedin', location: 'footer' })}>
				<ILinkedin /> <span>LinkedIn</span>
			</a>
			<a className="foot-btn" href={emailHref} aria-label="Email"
			   onClick={() => trackEvent('contact_clicked', { channel: 'email', location: 'footer' })}>
				<IMail /> <span>Email</span>
			</a>
		</div>
	);
}
