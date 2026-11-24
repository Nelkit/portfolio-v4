'use client';

import { useActionState, useState } from 'react';
import { deleteCategory, reorderCategories, saveCategory, type CategoryFormState } from './actions';
import { TagsInput } from '@/app/admin/components/TagsInput';
import { categoryField } from '@/app/lib/content/skills/skill-category';
import { LOCALES, type Locale } from '@/app/lib/i18n/locales';
import { Button } from '@/app/admin/components/ui/Button';
import { DeleteButton } from '@/app/admin/components/ui/DeleteButton';
import { safeAction } from '@/app/admin/components/ui/feedback';
import { useActionFeedback, useAsyncAction, useLeaveWarning, useUnsavedChanges } from '@/app/admin/components/ui/hooks';

export type CategoryRow = { id: number; names: Record<Locale, string>; skills: string[] };

const input =
	'w-full rounded border border-ui-border-2 bg-ui-surface px-3 py-2 outline-none focus:border-ui-accent aria-invalid:border-red-500';

function CategoryForm({ category, catalog, onSaved }: { category?: CategoryRow; catalog: string[]; onSaved?: () => void }) {
	const [state, action, pending] = useActionState<CategoryFormState, FormData>(safeAction(saveCategory), {});
	const errors = state.errors ?? {};
	const { formRef, markSaved } = useUnsavedChanges();
	useActionFeedback(state, category ? 'Saved, live on the site.' : 'Category added', () => {
		markSaved();
		onSaved?.();
	});

	return (
		<form ref={formRef} action={action} className="flex flex-col gap-3">
			{category && <input type="hidden" name="id" value={category.id} />}
			<div className="flex flex-wrap gap-2">
				{LOCALES.map((locale) => (
					<label key={locale} className="flex min-w-40 flex-1 flex-col gap-1">
						<span className="text-xs text-ui-faint">Name ({locale})</span>
						<input
							name={categoryField(locale)}
							lang={locale}
							required
							defaultValue={category?.names[locale] ?? ''}
							placeholder={locale === 'en' ? 'Mobile' : 'Móvil'}
							aria-invalid={Boolean(errors[categoryField(locale)])}
							className={input}
						/>
						{errors[categoryField(locale)] && <span className="text-xs text-red-400">{errors[categoryField(locale)]}</span>}
					</label>
				))}
			</div>
			<div className="flex flex-col gap-1">
				<span className="text-xs text-ui-faint">Skills — existing names are reused (ignoring case)</span>
				<TagsInput name="skills" initial={category?.skills ?? []} suggestions={catalog} placeholder="Swift, Kotlin… (Enter or comma)" error={errors.skills} />
			</div>
			<div className="flex items-center gap-3">
				<Button type="submit" loading={pending} loadingLabel="Saving…" className="self-start">
					{category ? 'Save' : '+ Add category'}
				</Button>
			</div>
		</form>
	);
}

export function SkillsEditor({ initial, catalog }: { initial: CategoryRow[]; catalog: string[] }) {
	const [rows, setRows] = useState(initial);
	const [dirty, setDirty] = useState(false);
	const order = useAsyncAction();
	const [newFormKey, setNewFormKey] = useState(0);
	useLeaveWarning(dirty);

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
			{rows.length === 0 && <p className="text-ui-faint">No categories yet.</p>}
			<ul className="flex flex-col gap-4">
				{rows.map((row, index) => (
					<li key={row.id} className="flex flex-col gap-3 rounded border border-ui-border p-4">
						<CategoryForm category={row} catalog={catalog} />
						<div className="flex items-center gap-3 text-sm">
							<span className="text-ui-faint">Tab {index + 1}</span>
							<button type="button" onClick={() => move(index, -1)} disabled={index === 0} className="px-1 text-ui-dim disabled:opacity-30" aria-label="Move up">↑</button>
							<button type="button" onClick={() => move(index, 1)} disabled={index === rows.length - 1} className="px-1 text-ui-dim disabled:opacity-30" aria-label="Move down">↓</button>
							<DeleteButton
								action={deleteCategory}
								id={row.id}
								className="px-0"
								confirmMessage={`Delete “${row.names.en}”?`}
								success={`Deleted “${row.names.en}”`}
								onDeleted={() => setRows((current) => current.filter((r) => r.id !== row.id))}
							/>
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
					onClick={() => order.run(() => reorderCategories(rows.map((r) => r.id)), { success: 'Order saved', onDone: () => setDirty(false) })}
				>
					Save order
				</Button>
			)}

			<section className="flex flex-col gap-2 rounded border border-dashed border-ui-border-2 p-4">
				<h2 className="text-sm font-semibold text-ui-text">New category</h2>
				<CategoryForm key={newFormKey} catalog={catalog} onSaved={() => setNewFormKey((k) => k + 1)} />
			</section>
		</div>
	);
}
