'use client';

import Link from 'next/link';
import { useActionState, useRef, useState } from 'react';
import { savePost, type SavePostState } from './actions';
import { PostMedia, type PostMediaProps } from './PostMedia';
import { Markdown } from '@/app/components/Markdown';
import { postField, readingTime, type PostInput, type PostTranslation } from '@/app/lib/content/posts/post';
import { LOCALES, type Locale } from '@/app/lib/i18n/locales';

const LANGUAGE_NAMES: Record<Locale, string> = { en: 'English', es: 'Español' };
const EMPTY: PostTranslation = { title: '', summary: '', body: '' };
const input =
	'w-full rounded border border-ui-border-2 bg-ui-surface px-3 py-2 outline-none focus:border-ui-accent aria-invalid:border-red-500';
const preview =
	'min-h-[60vh] overflow-auto rounded border border-ui-border p-5 text-sm leading-relaxed [&_a]:underline [&_blockquote]:border-l-2 [&_blockquote]:border-ui-border-2 [&_blockquote]:pl-3 [&_code]:text-emerald-300 [&_h1]:mb-3 [&_h1]:text-2xl [&_h1]:font-bold [&_h2]:mt-5 [&_h2]:text-xl [&_h2]:font-semibold [&_h3]:mt-4 [&_h3]:font-semibold [&_li]:ml-5 [&_ol]:list-decimal [&_p]:my-3 [&_pre]:overflow-x-auto [&_pre]:rounded [&_pre]:bg-ui-surface [&_pre]:p-3 [&_table]:my-3 [&_td]:border [&_td]:border-ui-border-2 [&_td]:px-2 [&_th]:border [&_th]:border-ui-border-2 [&_th]:px-2 [&_ul]:list-disc';

function Err({ message }: { message?: string }) {
	return message ? <span className="text-xs text-red-400">{message}</span> : null;
}

/**
 * Dedicated blog editor: one tab per language (write in one or both), Markdown
 * on the left and a live preview on the right. Inactive tabs stay mounted
 * (hidden) so every language is submitted.
 */
export function PostEditor({
	id,
	initial,
	media,
	uploadBaseUrl,
	tags,
}: {
	id?: number;
	initial: PostInput;
	/** Cover and body images (only for saved posts). */
	media?: Omit<PostMediaProps, 'postId'>;
	/** Available tags (English names). */
	tags: { id: number; name: string }[];
	/** Where upload: references point, for the live preview. */
	uploadBaseUrl: string;
}) {
	const [inserted, setInserted] = useState(false);
	// Status of the post as last saved (updated from each save's intent).
	const [isPublished, setIsPublished] = useState(initial.status === 'published');
	const [state, formAction, pending] = useActionState<SavePostState, FormData>(async (prev, data) => {
		const result = await savePost(prev, data);
		if (result.ok) {
			setInserted(false);
			setIsPublished(data.get('intent') === 'publish');
		}
		return result;
	}, {});
	const errors = state.errors ?? {};
	const [active, setActive] = useState<Locale>(LOCALES.find((l) => initial.translations[l]) ?? 'en');
	const [texts, setTexts] = useState<Record<Locale, PostTranslation>>(
		() => Object.fromEntries(LOCALES.map((l) => [l, initial.translations[l] ?? EMPTY])) as Record<Locale, PostTranslation>,
	);

	const set = (locale: Locale, key: keyof PostTranslation, value: string) =>
		setTexts((current) => ({ ...current, [locale]: { ...current[locale], [key]: value } }));
	const bodyRefs = useRef<Partial<Record<Locale, HTMLTextAreaElement | null>>>({});

	/** Inserts Markdown at the cursor of the active language's body (or at the end). */
	const insertIntoBody = (markdown: string) => {
		const el = bodyRefs.current[active];
		const body = texts[active].body;
		const at = el ? el.selectionStart : body.length;
		const before = body.slice(0, at).replace(/\s*$/, '');
		const after = body.slice(at).replace(/^\s*/, '');
		set(active, 'body', [before, markdown, after].filter(Boolean).join('\n\n'));
		setInserted(true);
	};
	const written = (locale: Locale) => Object.values(texts[locale]).some((v) => v.trim());
	const hasErrors = (locale: Locale) => Object.keys(errors).some((k) => k.endsWith(`_${locale}`));

	return (
		<form action={formAction} className="flex flex-col gap-6">
			{id && <input type="hidden" name="id" value={id} />}

			<section className="flex flex-wrap items-start gap-4">
				<label className="flex min-w-64 flex-1 flex-col gap-1">
					<span className="text-xs text-ui-faint">Slug — shared by both languages; empty = from the title</span>
					<input name="slug" defaultValue={initial.slug} placeholder="my-post" aria-invalid={Boolean(errors.slug)} className={input} />
					<Err message={errors.slug} />
				</label>
				<label className="flex flex-col gap-1">
					<span className="text-xs text-ui-faint">Publication date</span>
					<input type="date" name="publishedOn" required defaultValue={initial.publishedOn} aria-invalid={Boolean(errors.publishedOn)} className={input} />
					<Err message={errors.publishedOn} />
				</label>
			</section>

			<fieldset className="flex flex-col gap-2">
				<legend className="text-xs text-ui-faint">
					Tags {tags.length === 0 && <>— none yet, create them in <Link href="/admin/tags" className="underline">Blog tags</Link></>}
				</legend>
				<div className="flex flex-wrap gap-3">
					{tags.map((tag) => (
						<label key={tag.id} className="flex items-center gap-2 rounded border border-ui-border px-2 py-1 text-sm">
							<input type="checkbox" name="tagIds" value={tag.id} defaultChecked={initial.tagIds.includes(tag.id)} />
							{tag.name}
						</label>
					))}
				</div>
				<Err message={errors.tagIds} />
			</fieldset>

			{id && media ? (
				<PostMedia postId={id} coverUrl={media.coverUrl} images={media.images} onInsert={insertIntoBody} />
			) : (
				<p className="text-sm text-ui-faint">Cover and images can be added once the post is saved (a draft is enough).</p>
			)}
			{inserted && <p className="text-sm text-amber-400">Image inserted into the {LANGUAGE_NAMES[active]} body — remember to Save.</p>}

			<div className="flex items-center gap-2 border-b border-ui-border">
				{LOCALES.map((locale) => (
					<button
						key={locale}
						type="button"
						onClick={() => setActive(locale)}
						className={`px-4 py-2 text-sm ${active === locale ? 'border-b-2 border-ui-accent text-ui-text' : 'text-ui-faint'}`}
					>
						{LANGUAGE_NAMES[locale]}{' '}
						<span className={hasErrors(locale) ? 'text-red-400' : written(locale) ? 'text-emerald-400' : 'text-ui-faint'}>
							{hasErrors(locale) ? '●' : written(locale) ? '✓' : '—'}
						</span>
					</button>
				))}
				<span className="ml-auto text-xs text-ui-faint">Leave a language empty to publish only in the other one.</span>
			</div>
			<Err message={errors.translations} />

			{LOCALES.map((locale) => (
				<section key={locale} lang={locale} hidden={active !== locale} className="flex flex-col gap-4">
					<label className="flex flex-col gap-1">
						<span className="text-xs text-ui-faint">Title</span>
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
						<span className="text-xs text-ui-faint">Summary — shown in listings, optional</span>
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
							<span className="text-xs text-ui-faint">
								Body — Markdown · ~{readingTime(texts[locale].body)} min read
							</span>
							<textarea
								ref={(el) => { bodyRefs.current[locale] = el; }}
								name={postField('body', locale)}
								value={texts[locale].body}
								onChange={(e) => set(locale, 'body', e.target.value)}
								aria-invalid={Boolean(errors[postField('body', locale)])}
								className={`${input} min-h-[60vh] font-mono text-sm`}
							/>
							<Err message={errors[postField('body', locale)]} />
						</label>
						<div className="flex flex-col gap-1">
							<span className="text-xs text-ui-faint">Preview (code highlighting is applied on the site)</span>
							<div className={preview}>
								{texts[locale].title && <h1>{texts[locale].title}</h1>}
								{texts[locale].body.trim() ? <Markdown uploadBaseUrl={uploadBaseUrl}>{texts[locale].body}</Markdown> : <p className="text-ui-faint">Nothing to preview.</p>}
							</div>
						</div>
					</div>
				</section>
			))}

			<div className="flex flex-wrap items-center gap-3">
				<span className={`rounded px-2 py-1 text-xs ${isPublished ? 'bg-emerald-900 text-emerald-200' : 'bg-ui-surface-2 text-ui-text'}`}>
					{isPublished ? 'Published' : 'Draft — not visible on the site'}
				</span>
				{/* The clicked button's name/value ("intent") decides draft vs. published. */}
				<button type="submit" name="intent" value="publish" disabled={pending} className="rounded bg-ui-accent px-4 py-2 font-semibold text-ui-accent-ink disabled:opacity-50">
					{pending ? 'Saving…' : isPublished ? 'Update' : 'Publish'}
				</button>
				<button type="submit" name="intent" value="draft" disabled={pending} className="rounded border border-ui-border-2 px-4 py-2 text-sm disabled:opacity-50">
					{isPublished ? 'Unpublish (back to draft)' : 'Save draft'}
				</button>
				{state.ok && !pending && !inserted && (
					<span className="text-sm text-emerald-400">{isPublished ? 'Saved — live on the site.' : 'Draft saved.'}</span>
				)}
				{Object.keys(errors).length > 0 && <span className="text-sm text-red-400">Fix the highlighted fields.</span>}
			</div>
		</form>
	);
}
