'use client';

import { useActionState, useState } from 'react';
import { deleteEducationEntry, saveEducationEntry, type EducationFormState } from './actions';
import { EDUCATION_KEYS, educationField, type EducationTranslation } from '@/app/lib/content/education/education';
import { LOCALES, type Locale } from '@/app/lib/i18n/locales';
import { Button } from '@/app/admin/components/ui/Button';
import { DeleteButton } from '@/app/admin/components/ui/DeleteButton';
import { safeAction } from '@/app/admin/components/ui/feedback';
import { useActionFeedback, useUnsavedChanges } from '@/app/admin/components/ui/hooks';

export type EducationRow = {
	id: number;
	start: string;
	end: string;
	inProgress: boolean;
	texts: Record<Locale, EducationTranslation>;
};

const input =
	'w-full rounded border border-ui-border-2 bg-ui-surface px-3 py-2 outline-none focus:border-ui-accent aria-invalid:border-red-500';
const PLACEHOLDERS: Record<(typeof EDUCATION_KEYS)[number], string> = {
	degree: 'Degree',
	institution: 'Institution',
	description: 'Description (focus, capstone…) — optional',
	award: 'Badge, e.g. Summa Cum Laude — optional',
	note: 'Highlight, e.g. a scholarship for this degree — optional',
};
const REQUIRED = new Set<string>(['degree', 'institution']);

function Err({ message }: { message?: string }) {
	return message ? <span className="text-xs text-red-400">{message}</span> : null;
}

function EducationForm({ entry, onSaved }: { entry?: EducationRow; onSaved?: () => void }) {
	const [state, action, pending] = useActionState<EducationFormState, FormData>(safeAction(saveEducationEntry), {});
	const errors = state.errors ?? {};
	const { formRef, markSaved } = useUnsavedChanges();
	useActionFeedback(state, entry ? 'Saved, live on the site.' : 'Entry added', () => {
		markSaved();
		onSaved?.();
	});

	return (
		<form ref={formRef} action={action} className="flex flex-col gap-3">
			{entry && <input type="hidden" name="id" value={entry.id} />}
			<div className="flex flex-wrap items-start gap-3">
				<label className="flex flex-col gap-1">
					<span className="text-xs text-ui-faint">Start</span>
					<input type="month" name="start" required defaultValue={entry?.start} aria-invalid={Boolean(errors.start)} className={input} />
					<Err message={errors.start} />
				</label>
				<label className="flex flex-col gap-1">
					<span className="text-xs text-ui-faint">End — or expected end; optional while in progress</span>
					<input type="month" name="end" defaultValue={entry?.end} aria-invalid={Boolean(errors.end)} className={input} />
					<Err message={errors.end} />
				</label>
				<label className="mt-6 flex items-center gap-2 text-sm text-ui-text">
					<input type="checkbox" name="inProgress" defaultChecked={entry?.inProgress ?? false} /> In progress
				</label>
			</div>
			<div className="grid gap-3 md:grid-cols-2">
				{LOCALES.map((locale) => (
					<fieldset key={locale} lang={locale} className="flex flex-col gap-2">
						<legend className="text-xs text-ui-faint">{locale}</legend>
						{EDUCATION_KEYS.map((key) => {
							const name = educationField(key, locale);
							return (
								<div key={key} className="flex flex-col gap-1">
									<input
										name={name}
										required={REQUIRED.has(key)}
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
				<Button type="submit" loading={pending} loadingLabel="Saving…">
					{entry ? 'Save' : '+ Add entry'}
				</Button>
			</div>
		</form>
	);
}

export function EducationEditor({ initial }: { initial: EducationRow[] }) {
	const [newFormKey, setNewFormKey] = useState(0);

	return (
		<div className="flex flex-col gap-6">
			{initial.length === 0 && <p className="text-ui-faint">No entries yet.</p>}
			<ul className="flex flex-col gap-4">
				{initial.map((entry) => (
					<li key={entry.id} className="flex flex-col gap-3 rounded border border-ui-border p-4">
						<EducationForm entry={entry} />
						<DeleteButton
							action={deleteEducationEntry}
							id={entry.id}
							className="self-start px-0"
							confirmMessage={`Delete “${entry.texts.en.degree}”?`}
							success={`Deleted “${entry.texts.en.degree}”`}
						/>
					</li>
				))}
			</ul>
			<section className="flex flex-col gap-2 rounded border border-dashed border-ui-border-2 p-4">
				<h2 className="text-sm font-semibold text-ui-text">New entry</h2>
				<EducationForm key={newFormKey} onSaved={() => setNewFormKey((k) => k + 1)} />
			</section>
		</div>
	);
}
