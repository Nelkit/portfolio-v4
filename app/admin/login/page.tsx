'use client';

import { useActionState } from 'react';
import { login, type LoginState } from '@/app/admin/actions';
import { Button } from '@/app/admin/components/ui/Button';
import { safeAction } from '@/app/admin/components/ui/feedback';

export default function LoginPage() {
	const [state, formAction, pending] = useActionState<LoginState, FormData>(safeAction(login), {});

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
				className="rounded border border-ui-border-2 bg-ui-surface px-3 py-2 outline-none focus:border-ui-accent"
			/>
			{state.error && <p role="alert" className="text-sm text-red-400">{state.error}</p>}
			<Button type="submit" variant="primary" loading={pending} loadingLabel="Signing in…">
				Sign in
			</Button>
		</form>
	);
}
