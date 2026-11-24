'use client';

import { useActionState, useState } from 'react';
import { deleteArea, reorderAreas, saveArea, type AreaFormState } from './actions';
import { areaField } from '@/app/lib/content/areas/area';
import { LOCALES, type Locale } from '@/app/lib/i18n/locales';
import { Button } from '@/app/admin/components/ui/Button';
import { safeAction } from '@/app/admin/components/ui/feedback';
import { useActionFeedback, useAsyncAction, useLeaveWarning, useUnsavedChanges } from '@/app/admin/components/ui/hooks';

export type AreaRow = { id: number; names: Record<Locale, string>; projects: number };

const input =
	'w-full rounded border border-ui-border-2 bg-ui-surface px-3 py-2 outline-none focus:border-ui-accent aria-invalid:border-red-500';

/** One form per area (rename) or for a new area (no `area`). */
function AreaForm({ area, onSaved }: { area?: AreaRow; onSaved?: () => void }) {
	const [state, action, pending] = useActionState<AreaFormState, FormData>(safeAction(saveArea), {});
	const errors = state.errors ?? {};
	const { formRef, markSaved } = useUnsavedChanges();
	useActionFeedback(state, area ? 'Category saved' : 'Category added', () => {
		markSaved();
		onSaved?.();
	});

	return (
		<form ref={formRef} action={action} className="flex flex-wrap items-start gap-2">
			{area && <input type="hidden" name="id" value={area.id} />}
			{LOCALES.map((locale) => (
				<label key={locale} className="flex min-w-40 flex-1 flex-col gap-1">
					<span className="text-xs text-ui-faint">{locale}</span>
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
			<Button type="submit" className="mt-5" loading={pending} loadingLabel="Saving…">
				{area ? 'Save' : '+ Add area'}
			</Button>
		</form>
	);
}

export function AreasEditor({ initial }: { initial: AreaRow[] }) {
	const [rows, setRows] = useState(initial);
	const [dirty, setDirty] = useState(false);
	const [newFormKey, setNewFormKey] = useState(0);
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

	const remove = (row: AreaRow) => {
		if (!confirm(`Delete “${row.names.en}”?`)) return;
		setDeletingId(row.id);
		const data = new FormData();
		data.set('id', String(row.id));
		removal.run(
			async () => {
				const result = await deleteArea(data);
				if (!result.error) setRows((current) => current.filter((r) => r.id !== row.id));
				return result;
			},
			{ success: `Deleted “${row.names.en}”`, onDone: () => setDeletingId(null) },
		);
	};

	return (
		<div className="flex flex-col gap-6">
			{rows.length === 0 && <p className="text-ui-faint">No areas yet.</p>}
			<ul className="flex flex-col gap-4">
				{rows.map((row, index) => (
					<li key={row.id} className="flex flex-col gap-2 rounded border border-ui-border p-3">
						<AreaForm area={row} />
						<div className="flex items-center gap-3 text-sm">
							<span className="text-ui-faint">{row.projects} project{row.projects === 1 ? '' : 's'}</span>
							<button type="button" onClick={() => move(index, -1)} disabled={index === 0 || order.pending} className="px-1 text-ui-dim disabled:opacity-30" aria-label="Move up">↑</button>
							<button type="button" onClick={() => move(index, 1)} disabled={index === rows.length - 1 || order.pending} className="px-1 text-ui-dim disabled:opacity-30" aria-label="Move down">↓</button>
							<Button
								variant="danger"
								className="px-0"
								onClick={() => remove(row)}
								disabled={row.projects > 0 || (removal.pending && deletingId !== row.id)}
								title={row.projects > 0 ? 'Move its projects to another category first' : undefined}
								loading={deletingId === row.id}
								loadingLabel="Deleting…"
							>
								Delete
							</Button>
						</div>
					</li>
				))}
			</ul>

			{dirty && (
				<Button
					variant="primary"
					className="self-start text-sm"
					loading={order.pending}
					loadingLabel="Saving order…"
					onClick={() => order.run(() => reorderAreas(rows.map((r) => r.id)), { success: 'Order saved', onDone: () => setDirty(false) })}
				>
					Save order
				</Button>
			)}

			<section className="flex flex-col gap-2 rounded border border-dashed border-ui-border-2 p-3">
				<h2 className="text-sm font-semibold text-ui-text">New area</h2>
				{/* remount after a successful add to clear the inputs */}
				<AreaForm key={newFormKey} onSaved={() => setNewFormKey((k) => k + 1)} />
			</section>
		</div>
	);
}
