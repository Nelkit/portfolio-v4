import { notFound } from 'next/navigation';

// Unmatched URLs inside a locale (/es/does-not-exist) render [locale]/not-found.tsx
// within the localized root layout instead of an unstyled default 404.
export default function CatchAll() {
	notFound();
}
