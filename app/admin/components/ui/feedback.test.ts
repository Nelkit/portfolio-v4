import { describe, expect, it } from 'vitest';
import { errorMessage, formSnapshot, isRedirectError, safeAction } from './feedback';

describe('errorMessage', () => {
	it('uses the message of an Error', () => {
		expect(errorMessage(new Error('Upload too large'))).toBe('Upload too large');
	});

	it('replaces the generic production message and unknown values with a readable one', () => {
		const prod = new Error('An error occurred in the Server Components render. The specific message is omitted in production builds to avoid leaking sensitive details.');
		expect(errorMessage(prod)).toBe('The server could not complete the request. Try again.');
		expect(errorMessage('boom')).toBe('Something went wrong. Try again.');
		expect(errorMessage(new Error('  '))).toBe('Something went wrong. Try again.');
	});
});

describe('isRedirectError', () => {
	it('recognises the errors Next.js uses for redirect()', () => {
		expect(isRedirectError(Object.assign(new Error('NEXT_REDIRECT'), { digest: 'NEXT_REDIRECT;replace;/admin;307;' }))).toBe(true);
		expect(isRedirectError(new Error('nope'))).toBe(false);
		expect(isRedirectError(null)).toBe(false);
	});
});

describe('safeAction', () => {
	type State = { ok?: boolean; error?: string };

	it('passes the result through when the action succeeds', async () => {
		const action = safeAction(async (_prev: State, _data: FormData): Promise<State> => ({ ok: true }));
		expect(await action({}, new FormData())).toEqual({ ok: true });
	});

	it('turns a thrown error into an error state (never a silent failure)', async () => {
		const action = safeAction(async (): Promise<State> => {
			throw new Error('Database is down');
		});
		expect(await action({}, new FormData())).toEqual({ error: 'Database is down' });
	});

	it('rethrows redirects so navigation still happens', async () => {
		const redirect = Object.assign(new Error('NEXT_REDIRECT'), { digest: 'NEXT_REDIRECT;push;/admin;303;' });
		const action = safeAction(async (): Promise<State> => {
			throw redirect;
		});
		await expect(action({}, new FormData())).rejects.toBe(redirect);
	});
});

describe('formSnapshot', () => {
	const data = (entries: [string, string | File][]) => {
		const form = new FormData();
		for (const [k, v] of entries) form.append(k, v);
		return form;
	};

	it('is equal for the same values and different when a value changes', () => {
		expect(formSnapshot(data([['a', '1'], ['b', '2']]))).toBe(formSnapshot(data([['a', '1'], ['b', '2']])));
		expect(formSnapshot(data([['a', '1']]))).not.toBe(formSnapshot(data([['a', '2']])));
	});

	it('counts a chosen file as a change, but not an empty file input', () => {
		const empty = new File([], '');
		const chosen = new File(['abc'], 'cv.pdf');
		expect(formSnapshot(data([['cv', empty]]))).toBe(formSnapshot(data([])));
		expect(formSnapshot(data([['cv', chosen]]))).not.toBe(formSnapshot(data([])));
	});
});
