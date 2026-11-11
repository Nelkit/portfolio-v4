'use client';

import Link from 'next/link';
import { useI18n } from '@/app/lib/i18n/I18nProvider';

export default function NotFound() {
	const { t, href } = useI18n();
	return (
		<div className="page-loader">
			<div className="page-loader-inner" style={{ flexDirection: 'column', gap: 16, textAlign: 'center' }}>
				<h1 className="blog-heading">404<span className="ac">.</span></h1>
				<p className="blog-subheading">{t.common.notFound.title} — {t.common.notFound.body}</p>
				<Link href={href('/')} className="btn btn-outline">{t.common.notFound.home}</Link>
			</div>
		</div>
	);
}
