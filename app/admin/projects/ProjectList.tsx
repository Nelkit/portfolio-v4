'use client';

import Link from 'next/link';
import { useState } from 'react';
import { deleteProject, reorderProjects } from './actions';
import { Button } from '@/app/admin/components/ui/Button';
import { useAsyncAction, useLeaveWarning } from '@/app/admin/components/ui/hooks';

export type ProjectRow = { id: number; slug: string; title: string; featured: boolean };

const idForm = (id: number) => {
	const data = new FormData();
	data.set('id', String(id));
	return data;
};

export function ProjectList({ initial }: { initial: ProjectRow[] }) {
	const [rows, setRows] = useState(initial);
	const [dirty, setDirty] = useState(false);
	const [deletingId, setDeletingId] = useState<number | null>(null);
	const order = useAsyncAction();
	const removal = useAsyncAction();
	useLeaveWarning(dirty);

	const move = (index: number, delta: -1 | 1) => {
		const target = index + delta;
		if (target < 0 || target >= rows.length) return;
		const next = [...rows];
		[next[index], next[target]] = [next[target], next[index]];
		setRows(next);
		setDirty(true);
	};

	const saveOrder = () =>
		order.run(() => reorderProjects(rows.map((r) => r.id)), { success: 'Order saved', onDone: () => setDirty(false) });

	const remove = (row: ProjectRow) => {
		if (!confirm(`Delete “${row.title}”? This cannot be undone.`)) return;
		setDeletingId(row.id);
		removal.run(
			async () => {
				await deleteProject(idForm(row.id));
				setRows((current) => current.filter((r) => r.id !== row.id));
			},
			{ success: `Deleted “${row.title}”`, onDone: () => setDeletingId(null) },
		);
	};

	if (rows.length === 0) return <p className="text-ui-faint">No projects yet.</p>;

	return (
		<div className="flex flex-col gap-3">
			<ul className="flex flex-col divide-y divide-ui-border rounded border border-ui-border">
				{rows.map((row, index) => (
					<li key={row.id} className="flex items-center gap-3 px-4 py-3">
						<span className="w-6 text-right text-sm text-ui-faint">{index + 1}</span>
						<div className="flex flex-1 flex-col">
							<Link href={`/admin/projects/${row.id}`} className="hover:underline">
								{row.title}
								{row.featured && <span className="ml-2 text-xs text-ui-accent">featured</span>}
							</Link>
							<span className="text-xs text-ui-faint">/{row.slug}</span>
						</div>
						<button type="button" onClick={() => move(index, -1)} disabled={index === 0 || order.pending} className="px-2 text-ui-dim disabled:opacity-30" aria-label="Move up">↑</button>
						<button type="button" onClick={() => move(index, 1)} disabled={index === rows.length - 1 || order.pending} className="px-2 text-ui-dim disabled:opacity-30" aria-label="Move down">↓</button>
						<Button
							variant="danger"
							onClick={() => remove(row)}
							disabled={removal.pending && deletingId !== row.id}
							loading={deletingId === row.id}
							loadingLabel="Deleting…"
						>
							Delete
						</Button>
					</li>
				))}
			</ul>
			{dirty && (
				<div>
					<Button variant="primary" className="text-sm" onClick={saveOrder} loading={order.pending} loadingLabel="Saving order…">
						Save order
					</Button>
				</div>
			)}
		</div>
	);
}
