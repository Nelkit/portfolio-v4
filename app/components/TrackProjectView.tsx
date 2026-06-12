'use client';

import { useEffect } from 'react';
import { trackEvent } from '@/app/lib/analytics';

// Fires the project_opened event once when a project detail page mounts.
// Lives as a tiny client component so the detail page can stay a Server Component.
export function TrackProjectView({ slug, title }: { slug: string; title?: string }) {
	useEffect(() => {
		trackEvent('project_opened', { slug, title });
	}, [slug, title]);
	return null;
}
