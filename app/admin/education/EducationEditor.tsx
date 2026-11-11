'use client';

import { useActionState, useState } from 'react';
import { deleteEducationEntry, saveEducationEntry, type EducationFormState } from './actions';
import { EDUCATION_KEYS, educationField, type EducationTranslation } from '@/app/lib/content/education/education';
import { LOCALES, type Locale } from '@/app/lib/i18n/locales';

export type EducationRow = {
	id: number;
	start: string;
	end: string;
	inProgress: boolean;
	texts: Record<Locale, EducationTranslation>;
};

const input =
	'w-full rounded border border-zinc-700 bg-zinc-900 px-3 py-2 outline-none focus:border-zinc-400 aria-invalid:border-red-500';
const PLACEHOLDERS: Record<(typeof EDUCATION_KEYS)[number], string> = {
	degree: 'Degree',
	institution: 'Institution',
	description: 'Description (scholarship, focus…) — optional',
};

function Err({ message }: { message?: string }) {
	return message ? <span className="text-xs text-red-400">{message}</span> : null;
}

function EducationForm({ entry, onSaved }: { entry?: EducationRow; onSaved?: () => void }) {
	const [state, action, pending] = useActionState<EducationFormState, FormData>(async (prev, data) => {
		const result = await saveEducationEntry(prev, data);
		if (result.ok) onSaved?.();
		return result;
	}, {});
	const errors = state.errors ?? {};

	return (
		<form action={action} className="flex flex-col gap-3">
			{entry && <input type="hidden" name="id" value={entry.id} />}
			<div className="flex flex-wrap items-start gap-3">
				<label className="flex flex-col gap-1">
					<span className="text-xs text-zinc-500">Start</span>
					<input type="month" name="start" required defaultValue={entry?.start} aria-invalid={Boolean(errors.start)} className={input} />
					<Err message={errors.start} />
				</label>
				<label className="flex flex-col gap-1">
					<span className="text-xs text-zinc-500">End — or expected end; optional while in progress</span>
					<input type="month" name="end" defaultValue={entry?.end} aria-invalid={Boolean(errors.end)} className={input} />
					<Err message={errors.end} />
				</label>
				<label className="mt-6 flex items-center gap-2 text-sm text-zinc-300">
					<input type="checkbox" name="inProgress" defaultChecked={entry?.inProgress ?? false} /> In progress
				</label>
			</div>
			<div className="grid gap-3 md:grid-cols-2">
				{LOCALES.map((locale) => (
					<fieldset key={locale} lang={locale} className="flex flex-col gap-2">
						<legend className="text-xs text-zinc-500">{locale}</legend>
						{EDUCATION_KEYS.map((key) => {
							const name = educationField(key, locale);
							return (
								<div key={key} className="flex flex-col gap-1">
									<input
										name={name}
										required={key !== 'description'}
										placeholder={PLACEHOLDERS[key]}
										defaultValue={entry?.texts[locale][key]}
										aria-invalid={Boolean(errors[name])}
										className={input}
									/>
									<Err message={errors[name]} />
								</div>
							);
						})}
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

export function EducationEditor({ initial }: { initial: EducationRow[] }) {
	const [newFormKey, setNewFormKey] = useState(0);

	return (
		<div className="flex flex-col gap-6">
			{initial.length === 0 && <p className="text-zinc-500">No entries yet.</p>}
			<ul className="flex flex-col gap-4">
				{initial.map((entry) => (
					<li key={entry.id} className="flex flex-col gap-3 rounded border border-zinc-800 p-4">
						<EducationForm entry={entry} />
						<form
							action={deleteEducationEntry}
							onSubmit={(e) => { if (!confirm(`Delete “${entry.texts.en.degree}”?`)) e.preventDefault(); }}
						>
							<input type="hidden" name="id" value={entry.id} />
							<button type="submit" className="text-sm text-red-400">Delete</button>
						</form>
					</li>
				))}
			</ul>
			<section className="flex flex-col gap-2 rounded border border-dashed border-zinc-700 p-4">
				<h2 className="text-sm font-semibold text-zinc-300">New entry</h2>
				<EducationForm key={newFormKey} onSaved={() => setNewFormKey((k) => k + 1)} />
			</section>
		</div>
	);
}
