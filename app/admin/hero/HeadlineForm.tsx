'use client';

import { useActionState } from 'react';
import { saveHero, type SaveHeroState } from './actions';
import { HEADLINE_MAX_LENGTH, headlineField } from '@/app/lib/content/hero/hero';
import { LOCALES, type Locale } from '@/app/lib/i18n/locales';
import { Button } from '@/app/admin/components/ui/Button';
import { safeAction } from '@/app/admin/components/ui/feedback';
import { useActionFeedback, useUnsavedChanges } from '@/app/admin/components/ui/hooks';

const LANGUAGE_NAMES: Record<Locale, string> = { en: 'English', es: 'Español' };

export function HeadlineForm({ initial }: { initial: Record<Locale, string> }) {
	const [state, formAction, pending] = useActionState<SaveHeroState, FormData>(safeAction(saveHero), {});
	const { formRef, dirty, markSaved } = useUnsavedChanges();
	useActionFeedback(state, 'Saved, live on the site.', markSaved);

	return (
		<form ref={formRef} action={formAction} className="flex flex-col gap-5">
			<p className="text-sm text-ui-dim">
				Wrap the accent words in <code>&lt;em&gt;…&lt;/em&gt;</code>. Both languages are required.
			</p>

			{LOCALES.map((locale) => {
				const name = headlineField(locale);
				const error = state.errors?.[locale];
				return (
					<div key={locale} className="flex flex-col gap-2">
						<label htmlFor={name} className="text-sm text-ui-text">
							Headline — {LANGUAGE_NAMES[locale]} <span className="text-ui-faint">({locale})</span>
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
							className="rounded border border-ui-border-2 bg-ui-surface px-3 py-2 outline-none focus:border-ui-accent aria-invalid:border-red-500"
						/>
						{error && <span className="text-sm text-red-400">{error}</span>}
					</div>
				);
			})}

			<div className="flex items-center gap-4">
				<Button type="submit" variant="primary" loading={pending} loadingLabel="Saving…">Save</Button>
				{dirty && !pending && <span className="text-sm text-ui-faint">Unsaved changes</span>}
			</div>
		</form>
	);
}
