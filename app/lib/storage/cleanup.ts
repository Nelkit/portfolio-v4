import { getStorage, type FileStorage } from './storage';

/** The configured storage, or the reason it is unavailable (e.g. no R2 in production). */
export function storageOrError(): { storage: FileStorage } | { error: string } {
	try {
		return { storage: getStorage() };
	} catch (e) {
		return { error: (e as Error).message };
	}
}

/**
 * Best effort: deletes stored files that are no longer referenced.
 * A failed delete must never fail the user's action.
 * NOT a Server Action (plain server module), so it is not callable from the browser.
 */
export async function deleteStoredFiles(keys: (string | null | undefined)[]): Promise<void> {
	const valid = keys.filter((k): k is string => Boolean(k));
	if (valid.length === 0) return;
	const result = storageOrError();
	if ('storage' in result) await Promise.allSettled(valid.map((k) => result.storage.delete(k)));
}
