'use client';

import { useActionState, useState } from 'react';
import { savePost, type SavePostState } from './actions';
import { Markdown } from '@/app/components/Markdown';
import { postField, readingTime, type PostInput, type PostTranslation } from '@/app/lib/content/posts/post';
import { LOCALES, type Locale } from '@/app/lib/i18n/locales';

const LANGUAGE_NAMES: Record<Locale, string> = { en: 'English', es: 'Español' };
const EMPTY: PostTranslation = { title: '', summary: '', body: '' };
const input =
	'w-full rounded border border-zinc-700 bg-zinc-900 px-3 py-2 outline-none focus:border-zinc-400 aria-invalid:border-red-500';
const preview =
	'min-h-[60vh] overflow-auto rounded border border-zinc-800 p-5 text-sm leading-relaxed [&_a]:underline [&_blockquote]:border-l-2 [&_blockquote]:border-zinc-600 [&_blockquote]:pl-3 [&_code]:text-emerald-300 [&_h1]:mb-3 [&_h1]:text-2xl [&_h1]:font-bold [&_h2]:mt-5 [&_h2]:text-xl [&_h2]:font-semibold [&_h3]:mt-4 [&_h3]:font-semibold [&_li]:ml-5 [&_ol]:list-decimal [&_p]:my-3 [&_pre]:overflow-x-auto [&_pre]:rounded [&_pre]:bg-zinc-900 [&_pre]:p-3 [&_table]:my-3 [&_td]:border [&_td]:border-zinc-700 [&_td]:px-2 [&_th]:border [&_th]:border-zinc-700 [&_th]:px-2 [&_ul]:list-disc';

function Err({ message }: { message?: string }) {
	return message ? <span className="text-xs text-red-400">{message}</span> : null;
}

/**
 * Dedicated blog editor: one tab per language (write in one or both), Markdown
 * on the left and a live preview on the right. Inactive tabs stay mounted
 * (hidden) so every language is submitted.
 */
export function PostEditor({ id, initial }: { id?: number; initial: PostInput }) {
	const [state, formAction, pending] = useActionState<SavePostState, FormData>(savePost, {});
	const errors = state.errors ?? {};
	const [active, setActive] = useState<Locale>(LOCALES.find((l) => initial.translations[l]) ?? 'en');
	const [texts, setTexts] = useState<Record<Locale, PostTranslation>>(
		() => Object.fromEntries(LOCALES.map((l) => [l, initial.translations[l] ?? EMPTY])) as Record<Locale, PostTranslation>,
	);

	const set = (locale: Locale, key: keyof PostTranslation, value: string) =>
		setTexts((current) => ({ ...current, [locale]: { ...current[locale], [key]: value } }));
	const written = (locale: Locale) => Object.values(texts[locale]).some((v) => v.trim());
	const hasErrors = (locale: Locale) => Object.keys(errors).some((k) => k.endsWith(`_${locale}`));

	return (
		<form action={formAction} className="flex flex-col gap-6">
			{id && <input type="hidden" name="id" value={id} />}

			<section className="flex flex-wrap items-start gap-4">
				<label className="flex min-w-64 flex-1 flex-col gap-1">
					<span className="text-xs text-zinc-500">Slug — shared by both languages; empty = from the title</span>
					<input name="slug" defaultValue={initial.slug} placeholder="my-post" aria-invalid={Boolean(errors.slug)} className={input} />
					<Err message={errors.slug} />
				</label>
				<label className="flex flex-col gap-1">
					<span className="text-xs text-zinc-500">Publication date</span>
					<input type="date" name="publishedOn" required defaultValue={initial.publishedOn} aria-invalid={Boolean(errors.publishedOn)} className={input} />
					<Err message={errors.publishedOn} />
				</label>
			</section>

			<div className="flex items-center gap-2 border-b border-zinc-800">
				{LOCALES.map((locale) => (
					<button
						key={locale}
						type="button"
						onClick={() => setActive(locale)}
						className={`px-4 py-2 text-sm ${active === locale ? 'border-b-2 border-zinc-100 text-zinc-100' : 'text-zinc-500'}`}
					>
						{LANGUAGE_NAMES[locale]}{' '}
						<span className={hasErrors(locale) ? 'text-red-400' : written(locale) ? 'text-emerald-400' : 'text-zinc-600'}>
							{hasErrors(locale) ? '●' : written(locale) ? '✓' : '—'}
						</span>
					</button>
				))}
				<span className="ml-auto text-xs text-zinc-500">Leave a language empty to publish only in the other one.</span>
			</div>
			<Err message={errors.translations} />

			{LOCALES.map((locale) => (
				<section key={locale} lang={locale} hidden={active !== locale} className="flex flex-col gap-4">
					<label className="flex flex-col gap-1">
						<span className="text-xs text-zinc-500">Title</span>
						<input
							name={postField('title', locale)}
							value={texts[locale].title}
							onChange={(e) => set(locale, 'title', e.target.value)}
							aria-invalid={Boolean(errors[postField('title', locale)])}
							className={`${input} text-lg`}
						/>
						<Err message={errors[postField('title', locale)]} />
					</label>
					<label className="flex flex-col gap-1">
						<span className="text-xs text-zinc-500">Summary — shown in listings, optional</span>
						<textarea
							name={postField('summary', locale)}
							rows={2}
							value={texts[locale].summary}
							onChange={(e) => set(locale, 'summary', e.target.value)}
							aria-invalid={Boolean(errors[postField('summary', locale)])}
							className={input}
						/>
						<Err message={errors[postField('summary', locale)]} />
					</label>
					<div className="grid gap-4 lg:grid-cols-2">
						<label className="flex flex-col gap-1">
							<span className="text-xs text-zinc-500">
								Body — Markdown · ~{readingTime(texts[locale].body)} min read
							</span>
							<textarea
								name={postField('body', locale)}
								value={texts[locale].body}
								onChange={(e) => set(locale, 'body', e.target.value)}
								aria-invalid={Boolean(errors[postField('body', locale)])}
								className={`${input} min-h-[60vh] font-mono text-sm`}
							/>
							<Err message={errors[postField('body', locale)]} />
						</label>
						<div className="flex flex-col gap-1">
							<span className="text-xs text-zinc-500">Preview (code highlighting is applied on the site)</span>
							<div className={preview}>
								{texts[locale].title && <h1>{texts[locale].title}</h1>}
								{texts[locale].body.trim() ? <Markdown>{texts[locale].body}</Markdown> : <p className="text-zinc-500">Nothing to preview.</p>}
							</div>
						</div>
					</div>
				</section>
			))}

			<div className="flex items-center gap-4">
				<button type="submit" disabled={pending} className="rounded bg-zinc-100 px-4 py-2 font-semibold text-zinc-950 disabled:opacity-50">
					{pending ? 'Saving…' : id ? 'Save' : 'Publish post'}
				</button>
				{state.ok && !pending && <span className="text-sm text-emerald-400">Saved — live on the site.</span>}
				{Object.keys(errors).length > 0 && <span className="text-sm text-red-400">Fix the highlighted fields.</span>}
			</div>
		</form>
	);
}
