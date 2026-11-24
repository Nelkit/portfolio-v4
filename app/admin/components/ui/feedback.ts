/**
 * Framework-free helpers behind the admin feedback pattern (toasts, pending
 * states, unsaved changes). Kept pure so they can be unit tested.
 */

const GENERIC = 'Something went wrong. Try again.';
const SERVER = 'The server could not complete the request. Try again.';

/** A message fit for a toast, from anything an action may throw. */
export function errorMessage(error: unknown): string {
	if (!(error instanceof Error) || !error.message.trim()) return GENERIC;
	// In production Next.js replaces server error messages with a generic text.
	if (error.message.includes('omitted in production')) return SERVER;
	return error.message;
}

/** redirect() works by throwing; those errors must reach Next.js untouched. */
export function isRedirectError(error: unknown): boolean {
	const digest = (error as { digest?: unknown } | null)?.digest;
	return typeof digest === 'string' && digest.startsWith('NEXT_REDIRECT');
}

/**
 * Wraps a useActionState action so a thrown error becomes `{ error }` state
 * (shown as a toast) instead of crashing into the error boundary.
 */
export function safeAction<State extends { error?: string }>(
	action: (prev: State, data: FormData) => Promise<State>,
): (prev: State, data: FormData) => Promise<State> {
	return async (prev, data) => {
		try {
			return await action(prev, data);
		} catch (error) {
			if (isRedirectError(error)) throw error;
			return { error: errorMessage(error) } as State;
		}
	};
}

/** Comparable fingerprint of a form's values (files by name and size; empty file inputs ignored). */
export function formSnapshot(data: FormData): string {
	const entries: string[] = [];
	for (const [name, value] of data.entries()) {
		if (typeof value === 'string') entries.push(`${name}=${value}`);
		else if (value.size > 0 || value.name) entries.push(`${name}=file:${value.name}:${value.size}`);
	}
	return JSON.stringify(entries);
}
