export default function Loading() {
	return (
		<div className="proj-detail-root">
			<div className="bg-fx" aria-hidden="true">
				<div className="glow" /><div className="glow-2" />
				<div className="grid" /><div className="grain" />
			</div>

			<div className="post-wrap">
				<div className="skeleton skel-back" />
				<article className="post-article">
					<header className="post-header">
						<div className="skel-row">
							<div className="skeleton skel-chip" />
							<div className="skeleton skel-chip" />
						</div>
						<div className="skeleton skel-title" />
						<div className="skeleton skel-line" style={{ width: '70%' }} />
					</header>
					<div className="skeleton skel-image" />
					<div className="skeleton skel-line" />
					<div className="skeleton skel-line" />
					<div className="skeleton skel-line" style={{ width: '92%' }} />
					<div className="skeleton skel-line" style={{ width: '50%' }} />
				</article>
			</div>
		</div>
	);
}
