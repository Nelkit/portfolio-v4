'use client';

import { useActionState, useState } from 'react';
import { deleteCareerEntry, saveCareerEntry, type CareerFormState } from './actions';
import { careerField, type CareerTranslation } from '@/app/lib/content/career/career';
import { LOCALES, type Locale } from '@/app/lib/i18n/locales';
import { Button } from '@/app/admin/components/ui/Button';
import { DeleteButton } from '@/app/admin/components/ui/DeleteButton';
import { safeAction } from '@/app/admin/components/ui/feedback';
import { useActionFeedback, useUnsavedChanges } from '@/app/admin/components/ui/hooks';

export type CareerRow = { id: number; start: string; end: string; texts: Record<Locale, CareerTranslation> };

const input =
	'w-full rounded border border-ui-border-2 bg-ui-surface px-3 py-2 outline-none focus:border-ui-accent aria-invalid:border-red-500';

function Err({ message }: { message?: string }) {
	return message ? <span className="text-xs text-red-400">{message}</span> : null;
}

/** Form for one entry (edit) or a new one (no `entry`). */
function CareerForm({ entry, onSaved }: { entry?: CareerRow; onSaved?: () => void }) {
	const [state, action, pending] = useActionState<CareerFormState, FormData>(safeAction(saveCareerEntry), {});
	const errors = state.errors ?? {};
	const { formRef, markSaved } = useUnsavedChanges();
	useActionFeedback(state, entry ? 'Saved, live on the site.' : 'Entry added', () => {
		markSaved();
		onSaved?.();
	});

	return (
		<form ref={formRef} action={action} className="flex flex-col gap-3">
			{entry && <input type="hidden" name="id" value={entry.id} />}
			<div className="flex flex-wrap gap-3">
				<label className="flex flex-col gap-1">
					<span className="text-xs text-ui-faint">Start</span>
					<input type="month" name="start" required defaultValue={entry?.start} aria-invalid={Boolean(errors.start)} className={input} />
					<Err message={errors.start} />
				</label>
				<label className="flex flex-col gap-1">
					<span className="text-xs text-ui-faint">End — empty = current role</span>
					<input type="month" name="end" defaultValue={entry?.end} aria-invalid={Boolean(errors.end)} className={input} />
					<Err message={errors.end} />
				</label>
			</div>
			<div className="grid gap-3 md:grid-cols-2">
				{LOCALES.map((locale) => (
					<fieldset key={locale} lang={locale} className="flex flex-col gap-2">
						<legend className="text-xs text-ui-faint">{locale}</legend>
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
				<Button type="submit" loading={pending} loadingLabel="Saving…">
					{entry ? 'Save' : '+ Add entry'}
				</Button>
			</div>
		</form>
	);
}

export function CareerEditor({ initial }: { initial: CareerRow[] }) {
	const [newFormKey, setNewFormKey] = useState(0);

	return (
		<div className="flex flex-col gap-6">
			{initial.length === 0 && <p className="text-ui-faint">No entries yet.</p>}
			<ul className="flex flex-col gap-4">
				{initial.map((entry) => (
					<li key={entry.id} className="flex flex-col gap-3 rounded border border-ui-border p-4">
						<CareerForm entry={entry} />
						<DeleteButton
							action={deleteCareerEntry}
							id={entry.id}
							className="self-start px-0"
							confirmMessage={`Delete “${entry.texts.en.title}”?`}
							success={`Deleted “${entry.texts.en.title}”`}
						/>
					</li>
				))}
			</ul>
			<section className="flex flex-col gap-2 rounded border border-dashed border-ui-border-2 p-4">
				<h2 className="text-sm font-semibold text-ui-text">New entry</h2>
				<CareerForm key={newFormKey} onSaved={() => setNewFormKey((k) => k + 1)} />
			</section>
		</div>
	);
}
