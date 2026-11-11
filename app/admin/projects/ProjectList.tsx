'use client';

import Link from 'next/link';
import { useState, useTransition } from 'react';
import { deleteProject, reorderProjects } from './actions';

export type ProjectRow = { id: number; slug: string; title: string };

export function ProjectList({ initial }: { initial: ProjectRow[] }) {
	const [rows, setRows] = useState(initial);
	const [dirty, setDirty] = useState(false);
	const [saving, startSaving] = useTransition();

	const move = (index: number, delta: -1 | 1) => {
		const target = index + delta;
		if (target < 0 || target >= rows.length) return;
		const next = [...rows];
		[next[index], next[target]] = [next[target], next[index]];
		setRows(next);
		setDirty(true);
	};

	const saveOrder = () =>
		startSaving(async () => {
			await reorderProjects(rows.map((r) => r.id));
			setDirty(false);
		});

	if (rows.length === 0) return <p className="text-zinc-500">No projects yet.</p>;

	return (
		<div className="flex flex-col gap-3">
			<ul className="flex flex-col divide-y divide-zinc-800 rounded border border-zinc-800">
				{rows.map((row, index) => (
					<li key={row.id} className="flex items-center gap-3 px-4 py-3">
						<span className="w-6 text-right text-sm text-zinc-500">{index + 1}</span>
						<div className="flex flex-1 flex-col">
							<Link href={`/admin/projects/${row.id}`} className="hover:underline">{row.title}</Link>
							<span className="text-xs text-zinc-500">/{row.slug}</span>
						</div>
						<button type="button" onClick={() => move(index, -1)} disabled={index === 0} className="px-2 text-zinc-400 disabled:opacity-30" aria-label="Move up">↑</button>
						<button type="button" onClick={() => move(index, 1)} disabled={index === rows.length - 1} className="px-2 text-zinc-400 disabled:opacity-30" aria-label="Move down">↓</button>
						<form
							action={deleteProject}
							onSubmit={(e) => {
								if (!confirm(`Delete “${row.title}”? This cannot be undone.`)) e.preventDefault();
							}}
						>
							<input type="hidden" name="id" value={row.id} />
							<button type="submit" className="px-2 text-sm text-red-400">Delete</button>
						</form>
					</li>
				))}
			</ul>
			{dirty && (
				<div>
					<button type="button" onClick={saveOrder} disabled={saving} className="rounded bg-zinc-100 px-4 py-2 text-sm font-semibold text-zinc-950 disabled:opacity-50">
						{saving ? 'Saving order…' : 'Save order'}
					</button>
				</div>
			)}
		</div>
	);
}
