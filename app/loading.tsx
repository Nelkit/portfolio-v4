export default function Loading() {
	return (
		<div className="page-loader">
			<div className="page-loader-inner">
				<div className="page-loader-mark" aria-label="Loading">
					<span className="dot-live" />
				</div>
				<span className="page-loader-text">Loading…</span>
			</div>
		</div>
	);
}
