export default function Loading() {
	return (
		<div className="proj-detail-root">
			<div className="bg-fx" aria-hidden="true">
				<div className="glow" /><div className="glow-2" />
				<div className="grid" /><div className="grain" />
			</div>

			<div className="proj-list-wrap">
				<div className="blog-header">
					<div className="skeleton skel-back" />
					<div className="skeleton skel-title" style={{ width: '40%' }} />
					<div className="skeleton skel-line" style={{ width: '50%', marginTop: 10 }} />
				</div>

				<div className="proj-list-grid">
					{/* Featured project */}
					<div className="proj-list-card proj-list-card-feat">
						<div className="skeleton skel-card-img" />
						<div className="proj-list-body">
							<div className="skeleton skel-line" style={{ width: '25%' }} />
							<div className="skeleton skel-title" style={{ height: 24, margin: '10px 0' }} />
							<div className="skeleton skel-line" />
							<div className="skeleton skel-line" style={{ width: '70%' }} />
						</div>
					</div>
					{/* Grid projects */}
					{Array.from({ length: 4 }).map((_, i) => (
						<div className="proj-list-card" key={i}>
							<div className="skeleton skel-card-img" />
							<div className="proj-list-body">
								<div className="skeleton skel-line" style={{ width: '35%' }} />
								<div className="skeleton skel-line" style={{ width: '80%', marginTop: 8 }} />
								<div className="skeleton skel-line" style={{ width: '55%' }} />
							</div>
						</div>
					))}
				</div>
			</div>
		</div>
	);
}
