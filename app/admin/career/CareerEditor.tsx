'use client';

import { useActionState, useState } from 'react';
import { deleteCareerEntry, saveCareerEntry, type CareerFormState } from './actions';
import { careerField, type CareerTranslation } from '@/app/lib/content/career/career';
import { LOCALES, type Locale } from '@/app/lib/i18n/locales';

export type CareerRow = { id: number; start: string; end: string; texts: Record<Locale, CareerTranslation> };

const input =
	'w-full rounded border border-zinc-700 bg-zinc-900 px-3 py-2 outline-none focus:border-zinc-400 aria-invalid:border-red-500';

function Err({ message }: { message?: string }) {
	return message ? <span className="text-xs text-red-400">{message}</span> : null;
}

/** Form for one entry (edit) or a new one (no `entry`). */
function CareerForm({ entry, onSaved }: { entry?: CareerRow; onSaved?: () => void }) {
	const [state, action, pending] = useActionState<CareerFormState, FormData>(async (prev, data) => {
		const result = await saveCareerEntry(prev, data);
		if (result.ok) onSaved?.();
		return result;
	}, {});
	const errors = state.errors ?? {};

	return (
		<form action={action} className="flex flex-col gap-3">
			{entry && <input type="hidden" name="id" value={entry.id} />}
			<div className="flex flex-wrap gap-3">
				<label className="flex flex-col gap-1">
					<span className="text-xs text-zinc-500">Start</span>
					<input type="month" name="start" required defaultValue={entry?.start} aria-invalid={Boolean(errors.start)} className={input} />
					<Err message={errors.start} />
				</label>
				<label className="flex flex-col gap-1">
					<span className="text-xs text-zinc-500">End — empty = current role</span>
					<input type="month" name="end" defaultValue={entry?.end} aria-invalid={Boolean(errors.end)} className={input} />
					<Err message={errors.end} />
				</label>
			</div>
			<div className="grid gap-3 md:grid-cols-2">
				{LOCALES.map((locale) => (
					<fieldset key={locale} lang={locale} className="flex flex-col gap-2">
						<legend className="text-xs text-zinc-500">{locale}</legend>
						<input
							name={careerField('title', locale)}
							required
							placeholder="Role title"
							defaultValue={entry?.texts[locale].title}
							aria-invalid={Boolean(errors[careerField('title', locale)])}
							className={input}
						/>
						<Err message={errors[careerField('title', locale)]} />
						<input
							name={careerField('detail', locale)}
							placeholder="Detail (company, focus…) — optional"
							defaultValue={entry?.texts[locale].detail}
							aria-invalid={Boolean(errors[careerField('detail', locale)])}
							className={input}
						/>
						<Err message={errors[careerField('detail', locale)]} />
					</fieldset>
				))}
			</div>
			<div className="flex items-center gap-3">
				<button type="submit" disabled={pending} className="rounded border border-zinc-600 px-3 py-2 text-sm disabled:opacity-50">
					{pending ? 'Saving…' : entry ? 'Save' : '+ Add entry'}
				</button>
				{state.ok && !pending && entry && <span className="text-xs text-emerald-400">Saved — live on the site.</span>}
			</div>
		</form>
	);
}

export function CareerEditor({ initial }: { initial: CareerRow[] }) {
	const [newFormKey, setNewFormKey] = useState(0);

	return (
		<div className="flex flex-col gap-6">
			{initial.length === 0 && <p className="text-zinc-500">No entries yet.</p>}
			<ul className="flex flex-col gap-4">
				{initial.map((entry) => (
					<li key={entry.id} className="flex flex-col gap-3 rounded border border-zinc-800 p-4">
						<CareerForm entry={entry} />
						<form
							action={deleteCareerEntry}
							onSubmit={(e) => { if (!confirm(`Delete “${entry.texts.en.title}”?`)) e.preventDefault(); }}
						>
							<input type="hidden" name="id" value={entry.id} />
							<button type="submit" className="text-sm text-red-400">Delete</button>
						</form>
					</li>
				))}
			</ul>
			<section className="flex flex-col gap-2 rounded border border-dashed border-zinc-700 p-4">
				<h2 className="text-sm font-semibold text-zinc-300">New entry</h2>
				<CareerForm key={newFormKey} onSaved={() => setNewFormKey((k) => k + 1)} />
			</section>
		</div>
	);
}
