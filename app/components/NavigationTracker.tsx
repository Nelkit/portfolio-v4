'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { inAppHistory } from '@/app/lib/navigation/in-app-history';

/** Records each page of the visit (see in-app-history.ts). Renders nothing. */
export function NavigationTracker() {
	const pathname = usePathname();
	useEffect(() => {
		inAppHistory.visit(pathname);
	}, [pathname]);
	return null;
}
