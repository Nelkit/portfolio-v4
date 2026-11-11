'use client';

import { useActionState, useState } from 'react';
import { saveProfile, type SaveProfileState } from './actions';
import {
	LINK_TYPES,
	MAX_LINKS,
	TRANSLATED_KEYS,
	translatedField,
	type ProfileLink,
	type ProfileTranslation,
} from '@/app/lib/content/profile/profile';
import { MAX_BYTES } from '@/app/lib/storage/file-validation';
import { LOCALES, type Locale } from '@/app/lib/i18n/locales';

type TextTranslation = Omit<ProfileTranslation, 'cvKey'> & { cvUrl: string | null };

export type ProfileFormInitial = {
	name: string;
	avatarUrl: string | null;
	links: ProfileLink[];
	translations: Record<Locale, TextTranslation>;
};

const LANGUAGE_NAMES: Record<Locale, string> = { en: 'English', es: 'Español' };

const LABELS: Record<(typeof TRANSLATED_KEYS)[number], { label: string; multiline?: boolean; hint?: string }> = {
	role: { label: 'Role' },
	intro: { label: 'Intro', multiline: true },
	contactAvailable: { label: 'Contact — availability' },
	contactHeadline: { label: 'Contact — headline', hint: 'Wrap the accent in <em>…</em>' },
	contactDescription: { label: 'Contact — description', multiline: true },
};

const input =
	'w-full rounded border border-zinc-700 bg-zinc-900 px-3 py-2 outline-none focus:border-zinc-400 aria-invalid:border-red-500';
const mb = (bytes: number) => `${(bytes / 1024 / 1024).toFixed(2).replace(/\.?0+$/, '')} MB`;

function FieldError({ message }: { message?: string }) {
	return message ? <span className="text-sm text-red-400">{message}</span> : null;
}

export function ProfileForm({ initial }: { initial: ProfileFormInitial }) {
	const [state, formAction, pending] = useActionState<SaveProfileState, FormData>(saveProfile, {});
	const [links, setLinks] = useState<ProfileLink[]>(initial.links);
	const errors = state.errors ?? {};

	const updateLink = (index: number, patch: Partial<ProfileLink>) =>
		setLinks((current) => current.map((l, i) => (i === index ? { ...l, ...patch } : l)));
	const moveLink = (index: number, delta: -1 | 1) =>
		setLinks((current) => {
			const next = [...current];
			const target = index + delta;
			if (target < 0 || target >= next.length) return current;
			[next[index], next[target]] = [next[target], next[index]];
			return next;
		});

	return (
		<form action={formAction} className="flex flex-col gap-8">
			{/* ---- Language-independent ---- */}
			<section className="flex flex-col gap-4">
				<h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-400">General</h2>
				<label className="flex flex-col gap-2">
					<span className="text-sm text-zinc-300">Name</span>
					<input name="name" required defaultValue={initial.name} aria-invalid={Boolean(errors.name)} className={input} />
					<FieldError message={errors.name} />
				</label>

				<div className="flex items-start gap-4">
					{initial.avatarUrl ? (
						// eslint-disable-next-line @next/next/no-img-element
						<img src={initial.avatarUrl} alt="Current avatar" className="h-16 w-16 rounded-full object-cover" />
					) : (
						<div className="h-16 w-16 rounded-full border border-dashed border-zinc-700" />
					)}
					<div className="flex flex-col gap-2">
						<span className="text-sm text-zinc-300">Avatar (PNG, JPEG or WEBP · max {mb(MAX_BYTES.image)})</span>
						<input type="file" name="avatar" accept="image/png,image/jpeg,image/webp" className="text-sm" />
						{initial.avatarUrl && (
							<label className="flex items-center gap-2 text-sm text-zinc-400">
								<input type="checkbox" name="remove_avatar" /> Remove current avatar
							</label>
						)}
						<FieldError message={errors.avatar} />
					</div>
				</div>
			</section>

			{/* ---- Per language ---- */}
			<section className="grid gap-6 md:grid-cols-2">
				{LOCALES.map((locale) => {
					const t = initial.translations[locale];
					const cvField = `cv_${locale}`;
					return (
						<fieldset key={locale} lang={locale} className="flex flex-col gap-4 rounded border border-zinc-800 p-4">
							<legend className="px-1 text-sm font-semibold text-zinc-300">
								{LANGUAGE_NAMES[locale]} <span className="text-zinc-500">({locale})</span>
							</legend>
							{TRANSLATED_KEYS.map((key) => {
								const name = translatedField(key, locale);
								const meta = LABELS[key];
								const common = {
									name,
									required: true,
									defaultValue: t[key],
									'aria-invalid': Boolean(errors[name]),
									className: input,
								};
								return (
									<label key={key} className="flex flex-col gap-2">
										<span className="text-sm text-zinc-300">
											{meta.label} {meta.hint && <span className="text-zinc-500">— {meta.hint}</span>}
										</span>
										{meta.multiline ? <textarea rows={3} {...common} /> : <input {...common} />}
										<FieldError message={errors[name]} />
									</label>
								);
							})}

							<div className="flex flex-col gap-2">
								<span className="text-sm text-zinc-300">CV (PDF · max {mb(MAX_BYTES.pdf)})</span>
								{t.cvUrl && (
									<a href={t.cvUrl} target="_blank" rel="noreferrer" className="text-sm text-emerald-400 underline">
										Current CV
									</a>
								)}
								<input type="file" name={cvField} accept="application/pdf" className="text-sm" />
								{t.cvUrl && (
									<label className="flex items-center gap-2 text-sm text-zinc-400">
										<input type="checkbox" name={`remove_${cvField}`} /> Remove current CV
									</label>
								)}
								<FieldError message={errors[cvField]} />
							</div>
						</fieldset>
					);
				})}
			</section>

			{/* ---- Links ---- */}
			<section className="flex flex-col gap-3">
				<h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-400">
					Links <span className="normal-case text-zinc-500">— sidebar, footer and contact. The email link is the contact address.</span>
				</h2>
				<input type="hidden" name="links" value={JSON.stringify(links)} />
				{links.map((link, index) => (
					<div key={index} className="flex flex-wrap items-center gap-2">
						<select
							value={link.type}
							onChange={(e) => updateLink(index, { type: e.target.value as ProfileLink['type'] })}
							className="rounded border border-zinc-700 bg-zinc-900 px-2 py-2"
							aria-label="Link type"
						>
							{LINK_TYPES.map((type) => <option key={type} value={type}>{type}</option>)}
						</select>
						<input
							value={link.label}
							onChange={(e) => updateLink(index, { label: e.target.value })}
							placeholder="Label"
							aria-label="Link label"
							className="w-32 rounded border border-zinc-700 bg-zinc-900 px-3 py-2"
						/>
						<input
							value={link.url}
							onChange={(e) => updateLink(index, { url: e.target.value })}
							placeholder={link.type === 'email' ? 'you@example.com' : 'https://…'}
							aria-label="Link URL"
							className="min-w-48 flex-1 rounded border border-zinc-700 bg-zinc-900 px-3 py-2"
						/>
						<button type="button" onClick={() => moveLink(index, -1)} disabled={index === 0} className="px-2 text-zinc-400 disabled:opacity-30" aria-label="Move up">↑</button>
						<button type="button" onClick={() => moveLink(index, 1)} disabled={index === links.length - 1} className="px-2 text-zinc-400 disabled:opacity-30" aria-label="Move down">↓</button>
						<button type="button" onClick={() => setLinks((c) => c.filter((_, i) => i !== index))} className="px-2 text-red-400" aria-label="Remove link">✕</button>
					</div>
				))}
				<div>
					<button
						type="button"
						disabled={links.length >= MAX_LINKS}
						onClick={() => setLinks((c) => [...c, { type: 'link', label: '', url: '' }])}
						className="rounded border border-zinc-700 px-3 py-1 text-sm disabled:opacity-30"
					>
						+ Add link
					</button>
				</div>
				<FieldError message={errors.links} />
			</section>

			<div className="flex items-center gap-4">
				<button
					type="submit"
					disabled={pending}
					className="rounded bg-zinc-100 px-4 py-2 font-semibold text-zinc-950 disabled:opacity-50"
				>
					{pending ? 'Saving…' : 'Save'}
				</button>
				{state.ok && !pending && <span className="text-sm text-emerald-400">Saved — live on the site.</span>}
				{Object.keys(errors).length > 0 && (
					<span className="text-sm text-red-400">{errors.form ?? 'Fix the highlighted fields.'}</span>
				)}
			</div>
		</form>
	);
}
