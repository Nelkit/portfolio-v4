'use client';

import { useActionState } from 'react';
import { login, type LoginState } from '@/app/admin/actions';

export default function LoginPage() {
	const [state, formAction, pending] = useActionState<LoginState, FormData>(login, {});

	return (
		<form action={formAction} className="mx-auto mt-24 flex max-w-sm flex-col gap-4">
			<h1 className="text-xl font-semibold">Admin login</h1>
			<input
				type="password"
				name="password"
				required
				autoFocus
				autoComplete="current-password"
				placeholder="Password"
				className="rounded border border-zinc-700 bg-zinc-900 px-3 py-2 outline-none focus:border-zinc-400"
			/>
			{state.error && <p className="text-sm text-red-400">{state.error}</p>}
			<button
				type="submit"
				disabled={pending}
				className="rounded bg-zinc-100 px-3 py-2 font-semibold text-zinc-950 disabled:opacity-50"
			>
				{pending ? 'Signing in…' : 'Sign in'}
			</button>
		</form>
	);
}
