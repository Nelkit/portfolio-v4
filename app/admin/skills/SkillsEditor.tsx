'use client';

import { useActionState, useState, useTransition } from 'react';
import { deleteCategory, reorderCategories, saveCategory, type CategoryFormState } from './actions';
import { TagsInput } from '@/app/admin/components/TagsInput';
import { categoryField } from '@/app/lib/content/skills/skill-category';
import { LOCALES, type Locale } from '@/app/lib/i18n/locales';

export type CategoryRow = { id: number; names: Record<Locale, string>; skills: string[] };

const input =
	'w-full rounded border border-zinc-700 bg-zinc-900 px-3 py-2 outline-none focus:border-zinc-400 aria-invalid:border-red-500';

function CategoryForm({ category, catalog, onSaved }: { category?: CategoryRow; catalog: string[]; onSaved?: () => void }) {
	const [state, action, pending] = useActionState<CategoryFormState, FormData>(async (prev, data) => {
		const result = await saveCategory(prev, data);
		if (result.ok) onSaved?.();
		return result;
	}, {});
	const errors = state.errors ?? {};

	return (
		<form action={action} className="flex flex-col gap-3">
			{category && <input type="hidden" name="id" value={category.id} />}
			<div className="flex flex-wrap gap-2">
				{LOCALES.map((locale) => (
					<label key={locale} className="flex min-w-40 flex-1 flex-col gap-1">
						<span className="text-xs text-zinc-500">Name ({locale})</span>
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
				<span className="text-xs text-zinc-500">Skills — existing names are reused (ignoring case)</span>
				<TagsInput name="skills" initial={category?.skills ?? []} suggestions={catalog} placeholder="Swift, Kotlin… (Enter or comma)" error={errors.skills} />
			</div>
			<div className="flex items-center gap-3">
				<button type="submit" disabled={pending} className="rounded border border-zinc-600 px-3 py-2 text-sm disabled:opacity-50">
					{pending ? 'Saving…' : category ? 'Save' : '+ Add category'}
				</button>
				{state.ok && !pending && category && <span className="text-xs text-emerald-400">Saved — live on the site.</span>}
			</div>
		</form>
	);
}

export function SkillsEditor({ initial, catalog }: { initial: CategoryRow[]; catalog: string[] }) {
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
			{rows.length === 0 && <p className="text-zinc-500">No categories yet.</p>}
			<ul className="flex flex-col gap-4">
				{rows.map((row, index) => (
					<li key={row.id} className="flex flex-col gap-3 rounded border border-zinc-800 p-4">
						<CategoryForm category={row} catalog={catalog} />
						<div className="flex items-center gap-3 text-sm">
							<span className="text-zinc-500">Tab {index + 1}</span>
							<button type="button" onClick={() => move(index, -1)} disabled={index === 0} className="px-1 text-zinc-400 disabled:opacity-30" aria-label="Move up">↑</button>
							<button type="button" onClick={() => move(index, 1)} disabled={index === rows.length - 1} className="px-1 text-zinc-400 disabled:opacity-30" aria-label="Move down">↓</button>
							<form
								action={deleteCategory}
								onSubmit={(e) => { if (!confirm(`Delete “${row.names.en}”?`)) e.preventDefault(); }}
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
					onClick={() => startSaving(async () => { await reorderCategories(rows.map((r) => r.id)); setDirty(false); })}
					className="self-start rounded bg-zinc-100 px-4 py-2 text-sm font-semibold text-zinc-950 disabled:opacity-50"
				>
					{saving ? 'Saving order…' : 'Save order'}
				</button>
			)}

			<section className="flex flex-col gap-2 rounded border border-dashed border-zinc-700 p-4">
				<h2 className="text-sm font-semibold text-zinc-300">New category</h2>
				<CategoryForm key={newFormKey} catalog={catalog} onSaved={() => setNewFormKey((k) => k + 1)} />
			</section>
		</div>
	);
}
