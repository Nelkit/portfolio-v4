// Typed wrapper around GA4 custom events. No-op when GA isn't loaded
// (local dev without NEXT_PUBLIC_GA_ID, or before the script initializes).

type GtagFn = (command: 'event', action: string, params?: Record<string, unknown>) => void;

declare global {
	interface Window {
		gtag?: GtagFn;
	}
}

// Discriminated map of every custom event and its expected params.
type AnalyticsEvents = {
	chat_message_sent: { source: 'input' | 'suggestion' | 'fab' };
	chat_suggestion_clicked: { question: string };
	cv_downloaded: Record<string, never>;
	project_opened: { slug: string; title?: string };
	contact_clicked: { channel: 'email' | 'github' | 'linkedin' };
};

export function trackEvent<E extends keyof AnalyticsEvents>(
	event: E,
	params?: AnalyticsEvents[E],
): void {
	if (typeof window === 'undefined' || typeof window.gtag !== 'function') return;
	window.gtag('event', event, params);
}
