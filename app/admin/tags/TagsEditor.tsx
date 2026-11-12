'use client';

import { useActionState, useState } from 'react';
import { deleteTag, saveTag, type TagFormState } from './actions';
import { tagField } from '@/app/lib/content/tags/tag';
import { LOCALES, type Locale } from '@/app/lib/i18n/locales';

export type TagRow = { id: number; slug: string; names: Record<Locale, string>; posts: number };

const input =
	'w-full rounded border border-ui-border-2 bg-ui-surface px-3 py-2 outline-none focus:border-ui-accent aria-invalid:border-red-500';

function TagForm({ tag, onSaved }: { tag?: TagRow; onSaved?: () => void }) {
	const [state, action, pending] = useActionState<TagFormState, FormData>(async (prev, data) => {
		const result = await saveTag(prev, data);
		if (result.ok) onSaved?.();
		return result;
	}, {});
	const errors = state.errors ?? {};

	return (
		<form action={action} className="flex flex-wrap items-start gap-2">
			{tag && <input type="hidden" name="id" value={tag.id} />}
			{LOCALES.map((locale) => (
				<label key={locale} className="flex min-w-40 flex-1 flex-col gap-1">
					<span className="text-xs text-ui-faint">Name ({locale})</span>
					<input name={tagField(locale)} lang={locale} required defaultValue={tag?.names[locale] ?? ''} aria-invalid={Boolean(errors[tagField(locale)])} className={input} />
					{errors[tagField(locale)] && <span className="text-xs text-red-400">{errors[tagField(locale)]}</span>}
				</label>
			))}
			<label className="flex w-40 flex-col gap-1">
				<span className="text-xs text-ui-faint">Slug — ?tag= in URLs</span>
				<input name="slug" defaultValue={tag?.slug ?? ''} placeholder="from English name" aria-invalid={Boolean(errors.slug)} className={input} />
				{errors.slug && <span className="text-xs text-red-400">{errors.slug}</span>}
			</label>
			<button type="submit" disabled={pending} className="mt-5 rounded border border-ui-border-2 px-3 py-2 text-sm disabled:opacity-50">
				{pending ? 'Saving…' : tag ? 'Save' : '+ Add tag'}
			</button>
			{state.ok && !pending && tag && <span className="mt-7 text-xs text-emerald-400">Saved</span>}
		</form>
	);
}

export function TagsEditor({ initial }: { initial: TagRow[] }) {
	const [newFormKey, setNewFormKey] = useState(0);
	return (
		<div className="flex flex-col gap-6">
			{initial.length === 0 && <p className="text-ui-faint">No tags yet.</p>}
			<ul className="flex flex-col gap-4">
				{initial.map((tag) => (
					<li key={tag.id} className="flex flex-col gap-2 rounded border border-ui-border p-3">
						<TagForm tag={tag} />
						<div className="flex items-center gap-3 text-sm">
							<span className="text-ui-faint">{tag.posts} post{tag.posts === 1 ? '' : 's'}</span>
							<form
								action={deleteTag}
								onSubmit={(e) => {
									const note = tag.posts ? ` It will be removed from ${tag.posts} post(s).` : '';
									if (!confirm(`Delete “${tag.names.en}”?${note}`)) e.preventDefault();
								}}
							>
								<input type="hidden" name="id" value={tag.id} />
								<button type="submit" className="text-red-400">Delete</button>
							</form>
						</div>
					</li>
				))}
			</ul>
			<section className="flex flex-col gap-2 rounded border border-dashed border-ui-border-2 p-3">
				<h2 className="text-sm font-semibold text-ui-text">New tag</h2>
				<TagForm key={newFormKey} onSaved={() => setNewFormKey((k) => k + 1)} />
			</section>
		</div>
	);
}
