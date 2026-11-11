'use client';

import { useActionState, useState, useTransition } from 'react';
import { deleteArea, reorderAreas, saveArea, type AreaFormState } from './actions';
import { areaField } from '@/app/lib/content/areas/area';
import { LOCALES, type Locale } from '@/app/lib/i18n/locales';

export type AreaRow = { id: number; names: Record<Locale, string>; projects: number };

const input =
	'w-full rounded border border-zinc-700 bg-zinc-900 px-3 py-2 outline-none focus:border-zinc-400 aria-invalid:border-red-500';

/** One form per area (rename) or for a new area (no `area`). */
function AreaForm({ area, onSaved }: { area?: AreaRow; onSaved?: () => void }) {
	const [state, action, pending] = useActionState<AreaFormState, FormData>(async (prev, data) => {
		const result = await saveArea(prev, data);
		if (result.ok) onSaved?.();
		return result;
	}, {});
	const errors = state.errors ?? {};

	return (
		<form action={action} className="flex flex-wrap items-start gap-2">
			{area && <input type="hidden" name="id" value={area.id} />}
			{LOCALES.map((locale) => (
				<label key={locale} className="flex min-w-40 flex-1 flex-col gap-1">
					<span className="text-xs text-zinc-500">{locale}</span>
					<input
						name={areaField(locale)}
						lang={locale}
						required
						defaultValue={area?.names[locale] ?? ''}
						placeholder={locale === 'en' ? 'Machine Learning' : 'Aprendizaje automático'}
						aria-invalid={Boolean(errors[areaField(locale)])}
						className={input}
					/>
					{errors[areaField(locale)] && <span className="text-xs text-red-400">{errors[areaField(locale)]}</span>}
				</label>
			))}
			<button type="submit" disabled={pending} className="mt-5 rounded border border-zinc-600 px-3 py-2 text-sm disabled:opacity-50">
				{pending ? 'Saving…' : area ? 'Save' : '+ Add area'}
			</button>
			{state.ok && !pending && area && <span className="mt-7 text-xs text-emerald-400">Saved</span>}
		</form>
	);
}

export function AreasEditor({ initial }: { initial: AreaRow[] }) {
	const [rows, setRows] = useState(initial);
	const [dirty, setDirty] = useState(false);
	const [saving, startSaving] = useTransition();
	const [newFormKey, setNewFormKey] = useState(0);

	const move = (index: number, delta: -1 | 1) => {
		const target = index + delta;
		if (target < 0 || target >= rows.length) return;
		const next = [...rows];
		[next[index], next[target]] = [next[target], next[index]];
		setRows(next);
		setDirty(true);
	};

	return (
		<div className="flex flex-col gap-6">
			{rows.length === 0 && <p className="text-zinc-500">No areas yet.</p>}
			<ul className="flex flex-col gap-4">
				{rows.map((row, index) => (
					<li key={row.id} className="flex flex-col gap-2 rounded border border-zinc-800 p-3">
						<AreaForm area={row} />
						<div className="flex items-center gap-3 text-sm">
							<span className="text-zinc-500">{row.projects} project{row.projects === 1 ? '' : 's'}</span>
							<button type="button" onClick={() => move(index, -1)} disabled={index === 0} className="px-1 text-zinc-400 disabled:opacity-30" aria-label="Move up">↑</button>
							<button type="button" onClick={() => move(index, 1)} disabled={index === rows.length - 1} className="px-1 text-zinc-400 disabled:opacity-30" aria-label="Move down">↓</button>
							<form
								action={deleteArea}
								onSubmit={(e) => {
									const note = row.projects ? ` Its ${row.projects} project(s) will be left without area.` : '';
									if (!confirm(`Delete “${row.names.en}”?${note}`)) e.preventDefault();
								}}
							>
								<input type="hidden" name="id" value={row.id} />
								<button type="submit" className="text-red-400">Delete</button>
							</form>
						</div>
					</li>
				))}
			</ul>

			{dirty && (
				<button
					type="button"
					disabled={saving}
					onClick={() => startSaving(async () => { await reorderAreas(rows.map((r) => r.id)); setDirty(false); })}
					className="self-start rounded bg-zinc-100 px-4 py-2 text-sm font-semibold text-zinc-950 disabled:opacity-50"
				>
					{saving ? 'Saving order…' : 'Save order'}
				</button>
			)}

			<section className="flex flex-col gap-2 rounded border border-dashed border-zinc-700 p-3">
				<h2 className="text-sm font-semibold text-zinc-300">New area</h2>
				{/* remount after a successful add to clear the inputs */}
				<AreaForm key={newFormKey} onSaved={() => setNewFormKey((k) => k + 1)} />
			</section>
		</div>
	);
}
