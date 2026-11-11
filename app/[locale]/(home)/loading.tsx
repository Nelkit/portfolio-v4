'use client';

import { useI18n } from '@/app/lib/i18n/I18nProvider';

// loading.tsx receives no params, so it reads the locale from the provider.
export default function Loading() {
	const { t } = useI18n();
	return (
		<div className="page-loader">
			<div className="page-loader-inner">
				<div className="page-loader-mark" aria-label={t.common.loading}>
					<span className="dot-live" />
				</div>
				<span className="page-loader-text">{t.common.loading}</span>
			</div>
		</div>
	);
}
