'use client';

import { useActionState } from 'react';
import { saveHero, type SaveHeroState } from './actions';
import { HEADLINE_MAX_LENGTH, headlineField } from '@/app/lib/content/hero/hero';
import { LOCALES, type Locale } from '@/app/lib/i18n/locales';

const LANGUAGE_NAMES: Record<Locale, string> = { en: 'English', es: 'Español' };

export function HeadlineForm({ initial }: { initial: Record<Locale, string> }) {
	const [state, formAction, pending] = useActionState<SaveHeroState, FormData>(saveHero, {});

	return (
		<form action={formAction} className="flex flex-col gap-5">
			<p className="text-sm text-zinc-400">
				Wrap the accent words in <code>&lt;em&gt;…&lt;/em&gt;</code>. Both languages are required.
			</p>

			{LOCALES.map((locale) => {
				const name = headlineField(locale);
				const error = state.errors?.[locale];
				return (
					<div key={locale} className="flex flex-col gap-2">
						<label htmlFor={name} className="text-sm text-zinc-300">
							Headline — {LANGUAGE_NAMES[locale]} <span className="text-zinc-500">({locale})</span>
						</label>
						<textarea
							id={name}
							name={name}
							required
							rows={3}
							lang={locale}
							maxLength={HEADLINE_MAX_LENGTH}
							defaultValue={initial[locale]}
							aria-invalid={Boolean(error)}
							className="rounded border border-zinc-700 bg-zinc-900 px-3 py-2 outline-none focus:border-zinc-400 aria-invalid:border-red-500"
						/>
						{error && <span className="text-sm text-red-400">{error}</span>}
					</div>
				);
			})}

			<div className="flex items-center gap-4">
				<button
					type="submit"
					disabled={pending}
					className="rounded bg-zinc-100 px-4 py-2 font-semibold text-zinc-950 disabled:opacity-50"
				>
					{pending ? 'Saving…' : 'Save'}
				</button>
				{state.ok && !pending && <span className="text-sm text-emerald-400">Saved — live on the site.</span>}
			</div>
		</form>
	);
}
