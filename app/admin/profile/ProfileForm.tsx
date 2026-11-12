'use client';

import { useActionState } from 'react';
import { saveProfile, type SaveProfileState } from './actions';
import { LinksEditor } from '@/app/admin/components/LinksEditor';
import {
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
	'w-full rounded border border-ui-border-2 bg-ui-surface px-3 py-2 outline-none focus:border-ui-accent aria-invalid:border-red-500';
const mb = (bytes: number) => `${(bytes / 1024 / 1024).toFixed(2).replace(/\.?0+$/, '')} MB`;

function FieldError({ message }: { message?: string }) {
	return message ? <span className="text-sm text-red-400">{message}</span> : null;
}

export function ProfileForm({ initial }: { initial: ProfileFormInitial }) {
	const [state, formAction, pending] = useActionState<SaveProfileState, FormData>(saveProfile, {});
	const errors = state.errors ?? {};

	return (
		<form action={formAction} className="flex flex-col gap-8">
			{/* ---- Language-independent ---- */}
			<section className="flex flex-col gap-4">
				<h2 className="text-sm font-semibold uppercase tracking-wide text-ui-dim">General</h2>
				<label className="flex flex-col gap-2">
					<span className="text-sm text-ui-text">Name</span>
					<input name="name" required defaultValue={initial.name} aria-invalid={Boolean(errors.name)} className={input} />
					<FieldError message={errors.name} />
				</label>

				<div className="flex items-start gap-4">
					{initial.avatarUrl ? (
						// eslint-disable-next-line @next/next/no-img-element
						<img src={initial.avatarUrl} alt="Current avatar" className="h-16 w-16 rounded-full object-cover" />
					) : (
						<div className="h-16 w-16 rounded-full border border-dashed border-ui-border-2" />
					)}
					<div className="flex flex-col gap-2">
						<span className="text-sm text-ui-text">Avatar (PNG, JPEG or WEBP · max {mb(MAX_BYTES.image)})</span>
						<input type="file" name="avatar" accept="image/png,image/jpeg,image/webp" className="text-sm" />
						{initial.avatarUrl && (
							<label className="flex items-center gap-2 text-sm text-ui-dim">
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
						<fieldset key={locale} lang={locale} className="flex flex-col gap-4 rounded border border-ui-border p-4">
							<legend className="px-1 text-sm font-semibold text-ui-text">
								{LANGUAGE_NAMES[locale]} <span className="text-ui-faint">({locale})</span>
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
										<span className="text-sm text-ui-text">
											{meta.label} {meta.hint && <span className="text-ui-faint">— {meta.hint}</span>}
										</span>
										{meta.multiline ? <textarea rows={3} {...common} /> : <input {...common} />}
										<FieldError message={errors[name]} />
									</label>
								);
							})}

							<div className="flex flex-col gap-2">
								<span className="text-sm text-ui-text">CV (PDF · max {mb(MAX_BYTES.pdf)})</span>
								{t.cvUrl && (
									<a href={t.cvUrl} target="_blank" rel="noreferrer" className="text-sm text-emerald-400 underline">
										Current CV
									</a>
								)}
								<input type="file" name={cvField} accept="application/pdf" className="text-sm" />
								{t.cvUrl && (
									<label className="flex items-center gap-2 text-sm text-ui-dim">
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
				<h2 className="text-sm font-semibold uppercase tracking-wide text-ui-dim">
					Links <span className="normal-case text-ui-faint">— sidebar, footer and contact. The email link is the contact address.</span>
				</h2>
				<LinksEditor initial={initial.links} error={errors.links} />
			</section>

			<div className="flex items-center gap-4">
				<button
					type="submit"
					disabled={pending}
					className="rounded bg-ui-accent px-4 py-2 font-semibold text-ui-accent-ink disabled:opacity-50"
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
