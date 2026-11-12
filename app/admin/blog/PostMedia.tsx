'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { deletePostImage, removePostCover, uploadPostCover, uploadPostImage, type PostMediaResult } from './media-actions';
import { PROJECT_IMAGE_MAX_BYTES } from '@/app/lib/storage/file-validation';

export type PostMediaProps = {
	postId: number;
	coverUrl: string | null;
	images: { id: number; key: string; url: string }[];
};

const ACCEPT = 'image/png,image/jpeg,image/webp';
const fileForm = (postId: number, file: File) => {
	const data = new FormData();
	data.set('postId', String(postId));
	data.set('file', file);
	return data;
};

/**
 * Cover + body images of a saved post. Uploads are saved immediately; inserting
 * an image only edits the Markdown text (the post still needs "Save").
 */
export function PostMedia({ postId, coverUrl, images, onInsert }: PostMediaProps & { onInsert: (markdown: string) => void }) {
	const router = useRouter();
	const [busy, startBusy] = useTransition();
	const [status, setStatus] = useState('');
	const [errors, setErrors] = useState<string[]>([]);

	const run = (label: string, steps: (() => Promise<PostMediaResult>)[], after?: (results: PostMediaResult[]) => void) =>
		startBusy(async () => {
			const results: PostMediaResult[] = [];
			for (const [i, step] of steps.entries()) {
				setStatus(steps.length > 1 ? `${label} ${i + 1}/${steps.length}…` : `${label}…`);
				results.push(await step());
			}
			setErrors(results.flatMap((r) => (r.error ? [r.error] : [])));
			setStatus('');
			after?.(results);
			router.refresh();
		});

	const fileName = (key: string) => key.split('/').pop() ?? key;

	return (
		<section className="flex flex-col gap-4 rounded border border-ui-border p-4">
			<h2 className="text-sm font-semibold uppercase tracking-wide text-ui-dim">
				Images <span className="normal-case text-ui-faint">— saved immediately · PNG, JPEG or WEBP · max {PROJECT_IMAGE_MAX_BYTES / 1024 / 1024} MB each</span>
			</h2>

			<div className="flex flex-wrap items-start gap-4">
				{coverUrl ? (
					// eslint-disable-next-line @next/next/no-img-element
					<img src={coverUrl} alt="Cover" className="h-24 w-44 rounded object-cover" />
				) : (
					<div className="flex h-24 w-44 items-center justify-center rounded border border-dashed border-ui-border-2 text-xs text-ui-faint">No cover</div>
				)}
				<div className="flex flex-col gap-2">
					<span className="text-sm text-ui-text">Cover (cards, post header, social preview)</span>
					<input
						type="file"
						accept={ACCEPT}
						disabled={busy}
						className="text-sm"
						onChange={(e) => {
							const file = e.target.files?.[0];
							e.target.value = '';
							if (file) run('Uploading cover', [() => uploadPostCover(fileForm(postId, file))]);
						}}
					/>
					{coverUrl && (
						<button type="button" disabled={busy} onClick={() => confirm('Remove the cover?') && run('Removing', [() => removePostCover(postId)])} className="self-start text-sm text-red-400 disabled:opacity-50">
							Remove cover
						</button>
					)}
				</div>
			</div>

			<div className="flex flex-col gap-2">
				<span className="text-sm text-ui-text">Body images — uploading inserts them at the cursor of the active language</span>
				<input
					type="file"
					accept={ACCEPT}
					multiple
					disabled={busy}
					className="text-sm"
					onChange={(e) => {
						const files = Array.from(e.target.files ?? []);
						e.target.value = '';
						if (files.length === 0) return;
						run(
							'Uploading',
							files.map((file) => () => uploadPostImage(fileForm(postId, file))),
							(results) => {
								const markdown = results.flatMap((r) => (r.markdown ? [r.markdown] : [])).join('\n\n');
								if (markdown) onInsert(markdown);
							},
						);
					}}
				/>
				{images.length > 0 && (
					<ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
						{images.map((image) => (
							<li key={image.id} className="flex flex-col gap-1">
								{/* eslint-disable-next-line @next/next/no-img-element */}
								<img src={image.url} alt={fileName(image.key)} className="aspect-video w-full rounded object-cover" />
								<div className="flex justify-between text-xs">
									<button type="button" disabled={busy} onClick={() => onInsert(`![image](upload:${image.key})`)} className="text-emerald-400 disabled:opacity-50">
										Insert
									</button>
									<button
										type="button"
										disabled={busy}
										onClick={() => confirm('Delete this image?') && run('Deleting', [() => deletePostImage(postId, image.id)])}
										className="text-red-400 disabled:opacity-50"
									>
										Delete
									</button>
								</div>
							</li>
						))}
					</ul>
				)}
			</div>

			{status && <p className="text-sm text-ui-dim">{status}</p>}
			{errors.map((error) => <p key={error} className="text-sm text-red-400">{error}</p>)}
		</section>
	);
}
