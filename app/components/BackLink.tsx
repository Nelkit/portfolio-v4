'use client';

import type { MouseEvent, ReactNode } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { inAppHistory } from '@/app/lib/navigation/in-app-history';

/**
 * "Back" that returns to the page the visitor came from (e.g. /projects or the
 * home, at the same scroll position). On a direct entry there is no page of
 * the site to go back to, so it follows `href`.
 */
export function BackLink({ href, className, children }: { href: string; className?: string; children: ReactNode }) {
	const router = useRouter();

	function onClick(event: MouseEvent<HTMLAnchorElement>) {
		// Let Cmd/Ctrl-click and middle-click open `href` in a new tab.
		if (event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0) return;
		if (!inAppHistory.canGoBack()) return;
		event.preventDefault();
		router.back();
	}

	return (
		<Link href={href} className={className} onClick={onClick}>
			{children}
		</Link>
	);
}
