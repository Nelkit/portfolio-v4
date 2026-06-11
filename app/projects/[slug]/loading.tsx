export default function Loading() {
	return (
		<div className="proj-detail-root">
			<div className="bg-fx" aria-hidden="true">
				<div className="glow" /><div className="glow-2" />
				<div className="grid" /><div className="grain" />
			</div>

			<div className="proj-detail-wrap">
				<div className="skeleton skel-back" />
				<div className="proj-layout">
					<article className="proj-detail">
						<header className="proj-header">
							<div className="skeleton skel-chip" />
							<div className="skeleton skel-title" />
							<div className="skeleton skel-line" style={{ width: '80%' }} />
						</header>
						<div className="skeleton skel-image" />
						<div className="skeleton skel-line" />
						<div className="skeleton skel-line" />
						<div className="skeleton skel-line" style={{ width: '90%' }} />
						<div className="skeleton skel-line" style={{ width: '60%' }} />
					</article>
				</div>
			</div>
		</div>
	);
}
