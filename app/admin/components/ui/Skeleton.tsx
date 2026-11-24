/** Placeholder block shown while data loads (never an empty state that looks final). */
export function Skeleton({ className = 'h-4 w-full' }: { className?: string }) {
	return <div className={`animate-pulse rounded bg-ui-border ${className}`} aria-hidden="true" />;
}

/** Generic admin page skeleton: title, a few fields and a list. */
export function PageSkeleton({ label = 'Loading…' }: { label?: string }) {
	return (
		<main className="flex flex-col gap-6" aria-busy="true">
			<span className="sr-only" role="status">{label}</span>
			<Skeleton className="h-4 w-24" />
			<Skeleton className="h-7 w-64" />
			<div className="grid gap-4 md:grid-cols-2">
				<Skeleton className="h-10" />
				<Skeleton className="h-10" />
			</div>
			<div className="flex flex-col gap-3 rounded border border-ui-border p-4">
				{Array.from({ length: 5 }, (_, i) => <Skeleton key={i} className="h-5" />)}
			</div>
		</main>
	);
}
