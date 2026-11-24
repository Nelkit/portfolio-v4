'use client';

import { useCallback, useEffect, useRef, useState, useTransition } from 'react';
import { errorMessage, formSnapshot, isRedirectError } from './feedback';
import { useToast } from './Toaster';

/** Shape every admin action state shares. */
export type FeedbackState = { ok?: boolean; error?: string; errors?: Partial<Record<string, string>> };

/**
 * Turns each new useActionState result into a toast: success message, the
 * error, or a hint to fix the highlighted fields. `onSuccess` runs once per
 * successful result (e.g. mark the form saved, navigate).
 */
export function useActionFeedback(state: FeedbackState, success = 'Saved', onSuccess?: () => void) {
	const toast = useToast();
	const first = useRef(state);
	const onSuccessRef = useRef(onSuccess);
	useEffect(() => {
		onSuccessRef.current = onSuccess;
	});
	useEffect(() => {
		if (state === first.current) return; // initial state: nothing happened yet
		if (state.error) toast.error(state.error);
		else if (state.errors && Object.keys(state.errors).length > 0) toast.error(state.errors.form ?? 'Fix the highlighted fields.');
		else if (state.ok) {
			toast.success(success);
			onSuccessRef.current?.();
		}
	}, [state, success, toast]);
}

type RunOptions = { success?: string; onDone?: () => void };

/**
 * For actions called from code (delete, reorder, upload): pending flag plus
 * a toast at the end. A thrown error or an `{ error }` result is reported.
 */
export function useAsyncAction() {
	const toast = useToast();
	const [pending, startTransition] = useTransition();

	const run = useCallback(
		(action: () => Promise<unknown>, { success = 'Saved', onDone }: RunOptions = {}) =>
			startTransition(async () => {
				try {
					const result = await action();
					const error = (result as { error?: string } | undefined)?.error;
					if (error) toast.error(error);
					else toast.success(success);
				} catch (error) {
					if (isRedirectError(error)) throw error;
					toast.error(errorMessage(error));
				} finally {
					onDone?.();
				}
			}),
		[toast],
	);

	return { pending, run };
}

const LEAVE_MESSAGE = 'You have unsaved changes. Leave this page?';

/**
 * Warns before leaving a page with unsaved changes: closing or reloading the tab
 * (beforeunload) and clicking an internal link. Pass `true` while dirty.
 */
export function useLeaveWarning(dirty: boolean) {
	useEffect(() => {
		if (!dirty) return;
		const onBeforeUnload = (e: BeforeUnloadEvent) => e.preventDefault();
		// Capture phase: runs before Next.js <Link> handles the click.
		const onClick = (e: MouseEvent) => {
			const link = (e.target as Element | null)?.closest?.('a[href]');
			if (!link || link.getAttribute('target') === '_blank' || e.defaultPrevented) return;
			if (!confirm(LEAVE_MESSAGE)) {
				e.preventDefault();
				e.stopPropagation();
			}
		};
		window.addEventListener('beforeunload', onBeforeUnload);
		document.addEventListener('click', onClick, true);
		return () => {
			window.removeEventListener('beforeunload', onBeforeUnload);
			document.removeEventListener('click', onClick, true);
		};
	}, [dirty]);
}

/**
 * Tracks whether a form differs from how it was loaded (also catches changes
 * made by custom editors through hidden inputs). Call `markSaved()` after a
 * successful save. Includes the leave warning.
 */
export function useUnsavedChanges() {
	const formRef = useRef<HTMLFormElement>(null);
	const baseline = useRef<string | null>(null);
	const [dirty, setDirty] = useState(false);

	const read = () => (formRef.current ? formSnapshot(new FormData(formRef.current)) : null);

	useEffect(() => {
		const form = formRef.current;
		if (!form) return;
		baseline.current = read();
		// Hidden inputs update after React re-renders: compare on the next tick.
		const check = () => setTimeout(() => setDirty(read() !== baseline.current), 0);
		form.addEventListener('input', check);
		form.addEventListener('change', check);
		form.addEventListener('click', check);
		return () => {
			form.removeEventListener('input', check);
			form.removeEventListener('change', check);
			form.removeEventListener('click', check);
		};
	}, []);

	const markSaved = useCallback(() => {
		baseline.current = read();
		setDirty(false);
	}, []);

	useLeaveWarning(dirty);
	return { formRef, dirty, markSaved };
}
