'use client';

import { useActionState } from 'react';
import { saveProject, type SaveProjectState } from './actions';
import { LinksEditor } from '@/app/admin/components/LinksEditor';
import { MarkdownEditor } from '@/app/admin/components/MarkdownEditor';
import { projectField, type ProjectInput } from '@/app/lib/content/projects/project';
import { LOCALES, type Locale } from '@/app/lib/i18n/locales';

const LANGUAGE_NAMES: Record<Locale, string> = { en: 'English', es: 'Español' };
const input =
	'w-full rounded border border-zinc-700 bg-zinc-900 px-3 py-2 outline-none focus:border-zinc-400 aria-invalid:border-red-500';

function FieldError({ message }: { message?: string }) {
	return message ? <span className="text-sm text-red-400">{message}</span> : null;
}

export function ProjectForm({ id, initial }: { id?: number; initial: ProjectInput }) {
	const [state, formAction, pending] = useActionState<SaveProjectState, FormData>(saveProject, {});
	const errors = state.errors ?? {};

	return (
		<form action={formAction} className="flex flex-col gap-8">
			{id && <input type="hidden" name="id" value={id} />}

			<section className="grid gap-4 md:grid-cols-2">
				<label className="flex flex-col gap-2">
					<span className="text-sm text-zinc-300">
						Slug <span className="text-zinc-500">— shared by both languages; empty = from the English title</span>
					</span>
					<input name="slug" defaultValue={initial.slug} placeholder="my-project" aria-invalid={Boolean(errors.slug)} className={input} />
					<FieldError message={errors.slug} />
				</label>
				<label className="flex flex-col gap-2">
					<span className="text-sm text-zinc-300">Company <span className="text-zinc-500">— optional</span></span>
					<input name="company" defaultValue={initial.company} aria-invalid={Boolean(errors.company)} className={input} />
					<FieldError message={errors.company} />
				</label>
			</section>

			<section className="grid gap-6 lg:grid-cols-2">
				{LOCALES.map((locale) => {
					const t = initial.translations[locale];
					const title = projectField('title', locale);
					const summary = projectField('summary', locale);
					const description = projectField('description', locale);
					return (
						<fieldset key={locale} lang={locale} className="flex flex-col gap-4 rounded border border-zinc-800 p-4">
							<legend className="px-1 text-sm font-semibold text-zinc-300">
								{LANGUAGE_NAMES[locale]} <span className="text-zinc-500">({locale})</span>
							</legend>
							<label className="flex flex-col gap-2">
								<span className="text-sm text-zinc-300">Title</span>
								<input name={title} required defaultValue={t.title} aria-invalid={Boolean(errors[title])} className={input} />
								<FieldError message={errors[title]} />
							</label>
							<label className="flex flex-col gap-2">
								<span className="text-sm text-zinc-300">Summary <span className="text-zinc-500">— shown on cards</span></span>
								<textarea name={summary} required rows={2} defaultValue={t.summary} aria-invalid={Boolean(errors[summary])} className={input} />
								<FieldError message={errors[summary]} />
							</label>
							<div className="flex flex-col gap-2">
								<span className="text-sm text-zinc-300">Description <span className="text-zinc-500">— Markdown, optional</span></span>
								<MarkdownEditor name={description} lang={locale} defaultValue={t.description} invalid={Boolean(errors[description])} />
								<FieldError message={errors[description]} />
							</div>
						</fieldset>
					);
				})}
			</section>

			<section className="flex flex-col gap-3">
				<h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-400">
					Links <span className="normal-case text-zinc-500">— code, demo, store…</span>
				</h2>
				<LinksEditor initial={initial.links} error={errors.links} />
			</section>

			<div className="flex items-center gap-4">
				<button type="submit" disabled={pending} className="rounded bg-zinc-100 px-4 py-2 font-semibold text-zinc-950 disabled:opacity-50">
					{pending ? 'Saving…' : id ? 'Save' : 'Create project'}
				</button>
				{state.ok && !pending && <span className="text-sm text-emerald-400">Saved — live on the site.</span>}
				{Object.keys(errors).length > 0 && <span className="text-sm text-red-400">Fix the highlighted fields.</span>}
			</div>
		</form>
	);
}
