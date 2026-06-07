const POSTS = [
	{ date: 'May 2026', title: 'Why I bet my career on on-device ML',       read: '6 min', href: '/blog' },
	{ date: 'Mar 2026', title: 'Six rules for shipping mobile at scale',     read: '9 min', href: '/blog' },
	{ date: 'Jan 2026', title: 'From Honduras to UTS: notes on bridging',    read: '4 min', href: '/blog' },
];

export function RecentWritingSection() {
	return (
		<section id="writing" className="section">
			<div className="sec-head">
				<h2><span className="num">06</span> Recent writing<span className="ac">.</span></h2>
				<span className="note">notes on building, mobile &amp; ML</span>
			</div>

			<div className="write-list">
				{POSTS.map((p) => (
					<a key={p.title} className="write-row" href={p.href}>
						<span className="date">{p.date}</span>
						<span className="ti">{p.title}</span>
						<span className="read">{p.read} →</span>
					</a>
				))}
			</div>
		</section>
	);
}
