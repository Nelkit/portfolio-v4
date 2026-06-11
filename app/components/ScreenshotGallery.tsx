'use client';

import { useState } from 'react';
import Lightbox from 'yet-another-react-lightbox';
import Zoom from 'yet-another-react-lightbox/plugins/zoom';
import 'yet-another-react-lightbox/styles.css';

type Shot = { url: string; alt: string };

export function ScreenshotGallery({ screenshots }: { screenshots: Shot[] }) {
	const [index, setIndex] = useState(-1);

	return (
		<>
			<div className="proj-screenshots">
				{screenshots.map((s, i) => (
					<button
						key={s.url}
						type="button"
						className="proj-screenshot-wrap"
						onClick={() => setIndex(i)}
						aria-label={`Open screenshot: ${s.alt}`}
					>
						<img src={s.url} alt={s.alt} className="proj-screenshot" />
						<span className="proj-screenshot-overlay" aria-hidden="true">
							<span className="proj-screenshot-zoom">
								<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
									<circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5M11 8.5v5M8.5 11h5" />
								</svg>
							</span>
						</span>
					</button>
				))}
			</div>

			<Lightbox
				open={index >= 0}
				close={() => setIndex(-1)}
				index={index}
				slides={screenshots.map((s) => ({ src: s.url, alt: s.alt }))}
				plugins={[Zoom]}
				zoom={{ maxZoomPixelRatio: 3, scrollToZoom: true }}
				controller={{ closeOnBackdropClick: true }}
				styles={{
					container: { backgroundColor: 'rgba(10, 6, 16, 0.94)' },
				}}
				render={{
					// Hide nav arrows when there's a single screenshot
					buttonPrev: screenshots.length <= 1 ? () => null : undefined,
					buttonNext: screenshots.length <= 1 ? () => null : undefined,
				}}
			/>
		</>
	);
}
