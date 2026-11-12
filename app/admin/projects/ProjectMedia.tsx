'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import {
	addProjectScreenshot,
	removeProjectImage,
	removeProjectScreenshot,
	reorderProjectScreenshots,
	uploadProjectImage,
	type MediaResult,
} from './media-actions';
import { MAX_SCREENSHOTS } from '@/app/lib/content/projects/project';
import { PROJECT_IMAGE_MAX_BYTES } from '@/app/lib/storage/file-validation';

type Shot = { id: number; url: string };

const ACCEPT = 'image/png,image/jpeg,image/webp';
const LIMIT = `PNG, JPEG or WEBP · max ${PROJECT_IMAGE_MAX_BYTES / 1024 / 1024} MB each`;

const fileForm = (projectId: number, file: File) => {
	const data = new FormData();
	data.set('projectId', String(projectId));
	data.set('file', file);
	return data;
};

export function ProjectMedia({ projectId, imageUrl, screenshots }: { projectId: number; imageUrl: string | null; screenshots: Shot[] }) {
	const router = useRouter();
	const [busy, startBusy] = useTransition();
	const [status, setStatus] = useState('');
	const [errors, setErrors] = useState<string[]>([]);
	const [order, setOrder] = useState<Shot[]>(screenshots);
	const [orderDirty, setOrderDirty] = useState(false);

	/** Runs media actions one after another and refreshes the page data at the end. */
	const run = (label: string, steps: (() => Promise<MediaResult>)[]) =>
		startBusy(async () => {
			const failed: string[] = [];
			for (const [i, step] of steps.entries()) {
				setStatus(steps.length > 1 ? `${label} ${i + 1}/${steps.length}…` : `${label}…`);
				const result = await step();
				if (result.error) failed.push(result.error);
			}
			setErrors(failed);
			setStatus('');
			setOrderDirty(false);
			router.refresh();
		});

	const move = (index: number, delta: -1 | 1) => {
		const target = index + delta;
		if (target < 0 || target >= order.length) return;
		const next = [...order];
		[next[index], next[target]] = [next[target], next[index]];
		setOrder(next);
		setOrderDirty(true);
	};

	const remaining = MAX_SCREENSHOTS - order.length;

	return (
		<section className="flex flex-col gap-6 rounded border border-ui-border p-4">
			<h2 className="text-sm font-semibold uppercase tracking-wide text-ui-dim">
				Images <span className="normal-case text-ui-faint">— saved immediately · {LIMIT}</span>
			</h2>

			{/* ---- Main image ---- */}
			<div className="flex flex-wrap items-start gap-4">
				{imageUrl ? (
					// eslint-disable-next-line @next/next/no-img-element
					<img src={imageUrl} alt="Main image" className="h-28 w-48 rounded object-cover" />
				) : (
					<div className="flex h-28 w-48 items-center justify-center rounded border border-dashed border-ui-border-2 text-xs text-ui-faint">No main image</div>
				)}
				<div className="flex flex-col gap-2">
					<span className="text-sm text-ui-text">Main image (cards and project header)</span>
					<input
						type="file"
						accept={ACCEPT}
						disabled={busy}
						className="text-sm"
						onChange={(e) => {
							const file = e.target.files?.[0];
							e.target.value = '';
							if (file) run('Uploading main image', [() => uploadProjectImage(fileForm(projectId, file))]);
						}}
					/>
					{imageUrl && (
						<button
							type="button"
							disabled={busy}
							className="self-start text-sm text-red-400 disabled:opacity-50"
							onClick={() => confirm('Remove the main image?') && run('Removing', [() => removeProjectImage(projectId)])}
						>
							Remove main image
						</button>
					)}
				</div>
			</div>

			{/* ---- Screenshots ---- */}
			<div className="flex flex-col gap-3">
				<span className="text-sm text-ui-text">Screenshots ({order.length}/{MAX_SCREENSHOTS})</span>
				{order.length > 0 && (
					<ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
						{order.map((shot, index) => (
							<li key={shot.id} className="flex flex-col gap-1">
								{/* eslint-disable-next-line @next/next/no-img-element */}
								<img src={shot.url} alt={`Screenshot ${index + 1}`} className="aspect-video w-full rounded object-cover" />
								<div className="flex items-center justify-between text-sm">
									<span className="text-ui-faint">{index + 1}</span>
									<span className="flex gap-1">
										<button type="button" disabled={busy || index === 0} onClick={() => move(index, -1)} className="px-1 text-ui-dim disabled:opacity-30" aria-label="Move left">←</button>
										<button type="button" disabled={busy || index === order.length - 1} onClick={() => move(index, 1)} className="px-1 text-ui-dim disabled:opacity-30" aria-label="Move right">→</button>
										<button
											type="button"
											disabled={busy}
											onClick={() => confirm('Remove this screenshot?') && run('Removing', [() => removeProjectScreenshot(projectId, shot.id)])}
											className="px-1 text-red-400 disabled:opacity-30"
											aria-label="Remove screenshot"
										>
											✕
										</button>
									</span>
								</div>
							</li>
						))}
					</ul>
				)}
				{orderDirty && (
					<button
						type="button"
						disabled={busy}
						onClick={() => run('Saving order', [() => reorderProjectScreenshots(projectId, order.map((s) => s.id))])}
						className="self-start rounded bg-ui-accent px-3 py-1 text-sm font-semibold text-ui-accent-ink disabled:opacity-50"
					>
						Save screenshot order
					</button>
				)}
				{remaining > 0 && (
					<input
						type="file"
						accept={ACCEPT}
						multiple
						disabled={busy}
						className="text-sm"
						onChange={(e) => {
							const files = Array.from(e.target.files ?? []).slice(0, remaining);
							e.target.value = '';
							// One request per file: each stays under the Server Action body limit.
							if (files.length) run('Uploading', files.map((file) => () => addProjectScreenshot(fileForm(projectId, file))));
						}}
					/>
				)}
			</div>

			{status && <p className="text-sm text-ui-dim">{status}</p>}
			{errors.map((error) => <p key={error} className="text-sm text-red-400">{error}</p>)}
		</section>
	);
}
