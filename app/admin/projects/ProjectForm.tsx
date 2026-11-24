'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useActionState } from 'react';
import { saveProject, type SaveProjectState } from './actions';
import { LinksEditor } from '@/app/admin/components/LinksEditor';
import { MarkdownEditor } from '@/app/admin/components/MarkdownEditor';
import { TagsInput } from '@/app/admin/components/TagsInput';
import { Button } from '@/app/admin/components/ui/Button';
import { safeAction } from '@/app/admin/components/ui/feedback';
import { useActionFeedback, useUnsavedChanges } from '@/app/admin/components/ui/hooks';
import {
	PROJECT_LINK_LABELS,
	projectField,
	type ProjectFormValues,
	type ProjectTranslation,
} from '@/app/lib/content/projects/project';
import { en } from '@/app/lib/i18n/dictionaries/en';
import { LOCALES, type Locale } from '@/app/lib/i18n/locales';

const LANGUAGE_NAMES: Record<Locale, string> = { en: 'English', es: 'Español' };
const input =
	'w-full rounded border border-ui-border-2 bg-ui-surface px-3 py-2 outline-none focus:border-ui-accent aria-invalid:border-red-500';

/** Standard link labels, shown in English in the admin (the site translates them). */
const LINK_LABEL_OPTIONS = PROJECT_LINK_LABELS.map((value) => ({ value, label: en.projects.linkLabels[value] }));

/** Detail page sections after the Overview (the description), in display order. */
const DETAIL_SECTIONS = [
	['howItWorks', 'How it works'],
	['results', 'Results'],
	['myRole', 'My role'],
] as const satisfies readonly (readonly [keyof ProjectTranslation, string])[];

function FieldError({ message }: { message?: string }) {
	return message ? <span className="text-sm text-red-400">{message}</span> : null;
}

export type AreaOption = { id: number; name: string };

export function ProjectForm({
	id,
	initial,
	areas,
	skillCatalog,
}: {
	id?: number;
	initial: ProjectFormValues;
	areas: AreaOption[];
	/** Existing skill names, offered as suggestions. */
	skillCatalog: string[];
}) {
	const router = useRouter();
	const [state, formAction, pending] = useActionState<SaveProjectState, FormData>(safeAction(saveProject), {});
	const errors = state.errors ?? {};
	const { formRef, dirty, markSaved } = useUnsavedChanges();
	useActionFeedback(state, id ? 'Saved, live on the site.' : 'Project created.', () => {
		markSaved();
		if (state.redirectTo) router.push(state.redirectTo);
	});

	return (
		<form ref={formRef} action={formAction} className="flex flex-col gap-8">
			{id && <input type="hidden" name="id" value={id} />}

			<section className="grid gap-4 md:grid-cols-2">
				<label className="flex flex-col gap-2">
					<span className="text-sm text-ui-text">
						Slug <span className="text-ui-faint">· shared by both languages; empty = from the English title</span>
					</span>
					<input name="slug" defaultValue={initial.slug} placeholder="my-project" aria-invalid={Boolean(errors.slug)} className={input} />
					<FieldError message={errors.slug} />
				</label>
				<label className="flex flex-col gap-2">
					<span className="text-sm text-ui-text">
						Category <span className="text-ui-faint">· required, used to filter projects</span>
					</span>
					<select
						name="areaId"
						required
						defaultValue={initial.areaId ?? ''}
						aria-invalid={Boolean(errors.areaId)}
						className={input}
					>
						<option value="" disabled>Choose a category…</option>
						{areas.map((area) => <option key={area.id} value={area.id}>{area.name}</option>)}
					</select>
					{areas.length === 0 && (
						<span className="text-xs text-ui-faint">No categories yet. Create them in <Link href="/admin/areas" className="underline">Expertise areas</Link>.</span>
					)}
					<FieldError message={errors.areaId} />
				</label>
				<label className="flex flex-col gap-2">
					<span className="text-sm text-ui-text">Organisation <span className="text-ui-faint">· optional, e.g. UTS or the client</span></span>
					<input name="organisation" defaultValue={initial.organisation} aria-invalid={Boolean(errors.organisation)} className={input} />
					<FieldError message={errors.organisation} />
				</label>
				<label className="flex flex-col gap-2">
					<span className="text-sm text-ui-text">Year <span className="text-ui-faint">· optional, shown as YEAR · ORGANISATION</span></span>
					<input name="year" inputMode="numeric" defaultValue={initial.year ?? ''} placeholder="2026" aria-invalid={Boolean(errors.year)} className={input} />
					<FieldError message={errors.year} />
				</label>
				<label className="flex items-center gap-3">
					<input type="checkbox" name="featured" defaultChecked={initial.featured} className="h-4 w-4 accent-ui-accent" />
					<span className="text-sm text-ui-text">Featured <span className="text-ui-faint">· shown in “Selected work” on the home page</span></span>
				</label>
				<label className="flex flex-col gap-2">
					<span className="text-sm text-ui-text">Featured order <span className="text-ui-faint">· lower first; the first two get full-width cards</span></span>
					<input name="featuredOrder" inputMode="numeric" defaultValue={initial.featuredOrder} aria-invalid={Boolean(errors.featuredOrder)} className={input} />
					<FieldError message={errors.featuredOrder} />
				</label>
			</section>

			<section className="flex flex-col gap-2">
				<h2 className="text-sm font-semibold uppercase tracking-wide text-ui-dim">
					Tech stack <span className="normal-case text-ui-faint">· technologies used; existing names are reused (ignoring case); cards show the first 7</span>
				</h2>
				<TagsInput name="skills" initial={initial.skills} suggestions={skillCatalog} placeholder="Swift, CoreML… (Enter or comma)" error={errors.skills} />
			</section>

			<section className="grid gap-6 lg:grid-cols-2">
				{LOCALES.map((locale) => {
					const t = initial.translations[locale];
					const field = (key: keyof ProjectTranslation) => projectField(key, locale);
					return (
						<fieldset key={locale} lang={locale} className="flex flex-col gap-4 rounded border border-ui-border p-4">
							<legend className="px-1 text-sm font-semibold text-ui-text">
								{LANGUAGE_NAMES[locale]} <span className="text-ui-faint">({locale})</span>
							</legend>
							<label className="flex flex-col gap-2">
								<span className="text-sm text-ui-text">Title</span>
								<input name={field('title')} required defaultValue={t.title} aria-invalid={Boolean(errors[field('title')])} className={input} />
								<FieldError message={errors[field('title')]} />
							</label>
							<label className="flex flex-col gap-2">
								<span className="text-sm text-ui-text">Summary <span className="text-ui-faint">· shown on cards</span></span>
								<textarea name={field('summary')} required rows={2} defaultValue={t.summary} aria-invalid={Boolean(errors[field('summary')])} className={input} />
								<FieldError message={errors[field('summary')]} />
							</label>
							<label className="flex flex-col gap-2">
								<span className="text-sm text-ui-text">Key result <span className="text-ui-faint">· optional, short highlighted line on cards</span></span>
								<input name={field('keyResult')} defaultValue={t.keyResult} aria-invalid={Boolean(errors[field('keyResult')])} className={input} />
								<FieldError message={errors[field('keyResult')]} />
							</label>
							<label className="flex flex-col gap-2">
								<span className="text-sm text-ui-text">Role <span className="text-ui-faint">· optional, e.g. Frontend Lead (shown under “My role”)</span></span>
								<input name={field('role')} defaultValue={t.role} aria-invalid={Boolean(errors[field('role')])} className={input} />
								<FieldError message={errors[field('role')]} />
							</label>
							<div className="flex flex-col gap-2">
								<span className="text-sm text-ui-text">Overview <span className="text-ui-faint">· Markdown, optional</span></span>
								<MarkdownEditor name={field('description')} lang={locale} defaultValue={t.description} invalid={Boolean(errors[field('description')])} />
								<FieldError message={errors[field('description')]} />
							</div>
							{DETAIL_SECTIONS.map(([key, label]) => (
								<div key={key} className="flex flex-col gap-2">
									<span className="text-sm text-ui-text">{label} <span className="text-ui-faint">· Markdown, optional; hidden when empty</span></span>
									<MarkdownEditor name={field(key)} lang={locale} defaultValue={t[key]} invalid={Boolean(errors[field(key)])} />
									<FieldError message={errors[field(key)]} />
								</div>
							))}
						</fieldset>
					);
				})}
			</section>

			<section className="flex flex-col gap-3">
				<h2 className="text-sm font-semibold uppercase tracking-wide text-ui-dim">
					Links <span className="normal-case text-ui-faint">· code, demo, store…</span>
				</h2>
				<LinksEditor initial={initial.links} error={errors.links} labelOptions={LINK_LABEL_OPTIONS} />
			</section>

			<div className="flex items-center gap-4">
				<Button type="submit" variant="primary" loading={pending} loadingLabel={id ? 'Saving…' : 'Creating…'}>
					{id ? 'Save' : 'Create project'}
				</Button>
				{dirty && !pending && <span className="text-sm text-ui-faint">Unsaved changes</span>}
			</div>
		</form>
	);
}
