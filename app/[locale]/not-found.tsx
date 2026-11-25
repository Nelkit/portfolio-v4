'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { IArrowLeft, IArrowUR } from '@/app/components/icons';
import { SiteTopbar } from '@/app/components/SiteTopbar';
import { useI18n } from '@/app/lib/i18n/I18nProvider';

/** Path as the visitor typed it; malformed escapes are shown untouched. */
function readablePath(path: string): string {
	try {
		return decodeURI(path);
	} catch {
		return path;
	}
}

export default function NotFound() {
	const { t, href } = useI18n();
	const pathname = usePathname();
	const copy = t.common.notFound;

	return (
		<div className="nf-root">
			<div className="bg-fx" aria-hidden="true">
				<div className="glow" />
				<div className="glow-2" />
				<div className="grid" />
				<div className="grain" />
			</div>
			<SiteTopbar />

			<main className="nf-main">
				<div className="nf-card">
					<p className="nf-eyebrow"><span className="dot-live" /> {copy.eyebrow}</p>
					<p className="nf-code" aria-hidden="true">404<span className="ac">.</span></p>
					<h1 className="nf-title">{copy.title}</h1>
					<p className="nf-body">{copy.body}</p>
					<p className="nf-term">
						<span className="nf-prompt" aria-hidden="true">$</span>
						<span className="nf-path">GET {readablePath(pathname)}</span>
						<span className="nf-caret" aria-hidden="true" />
					</p>
					<div className="nf-actions">
						<Link href={href('/')} className="btn btn-accent"><IArrowLeft /> {copy.home}</Link>
						<Link href={href('/projects')} className="btn btn-outline">{copy.projects} <IArrowUR /></Link>
						<Link href={href('/blog')} className="btn btn-outline">{copy.blog} <IArrowUR /></Link>
					</div>
				</div>
			</main>
		</div>
	);
}
