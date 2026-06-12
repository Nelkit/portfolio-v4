export default function Loading() {
	return (
		<div className="proj-detail-root">
			<div className="bg-fx" aria-hidden="true">
				<div className="glow" /><div className="glow-2" />
				<div className="grid" /><div className="grain" />
			</div>

			<div className="blog-wrap">
				<div className="blog-header">
					<div className="skeleton skel-back" />
					<div className="skeleton skel-title" style={{ width: '40%' }} />
					<div className="skeleton skel-line" style={{ width: '55%', marginTop: 10 }} />
				</div>

				<div className="blog-grid">
					{/* Featured card */}
					<div className="blog-card blog-card-feat">
						<div className="skeleton skel-card-img" />
						<div className="blog-card-body">
							<div className="skeleton skel-line" style={{ width: '30%' }} />
							<div className="skeleton skel-title" style={{ height: 26, margin: '12px 0' }} />
							<div className="skeleton skel-line" />
							<div className="skeleton skel-line" style={{ width: '80%' }} />
						</div>
					</div>
					{/* Grid cards */}
					{Array.from({ length: 4 }).map((_, i) => (
						<div className="blog-card" key={i}>
							<div className="skeleton skel-card-img" />
							<div className="blog-card-body">
								<div className="skeleton skel-line" style={{ width: '40%' }} />
								<div className="skeleton skel-line" style={{ width: '85%', marginTop: 8 }} />
								<div className="skeleton skel-line" style={{ width: '60%' }} />
							</div>
						</div>
					))}
				</div>
			</div>
		</div>
	);
}
