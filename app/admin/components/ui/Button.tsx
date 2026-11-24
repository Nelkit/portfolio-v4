'use client';

import { useFormStatus } from 'react-dom';
import { Spinner } from './Spinner';

const VARIANTS = {
	primary: 'rounded bg-ui-accent px-4 py-2 font-semibold text-ui-accent-ink',
	secondary: 'rounded border border-ui-border-2 px-3 py-2 text-sm',
	danger: 'px-2 text-sm text-red-400',
	link: 'text-sm text-ui-dim hover:text-ui-text',
} as const;

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
	variant?: keyof typeof VARIANTS;
	/** While true: spinner, disabled (no double submit) and `loadingLabel` instead of the children. */
	loading?: boolean;
	loadingLabel?: React.ReactNode;
};

/** The one admin button: every async action shows its pending state through it. */
export function Button({ variant = 'secondary', loading = false, loadingLabel, disabled, className = '', children, type = 'button', ...rest }: ButtonProps) {
	return (
		<button
			type={type}
			disabled={disabled || loading}
			aria-busy={loading || undefined}
			className={`inline-flex items-center justify-center gap-2 disabled:opacity-50 ${VARIANTS[variant]} ${className}`}
			{...rest}
		>
			{loading && <Spinner />}
			{loading ? (loadingLabel ?? children) : children}
		</button>
	);
}

/** Submit button that reads the pending state of its parent <form action={…}>. */
export function SubmitButton(props: Omit<ButtonProps, 'type' | 'loading'> & { pending?: boolean }) {
	const status = useFormStatus();
	const { pending, ...rest } = props;
	return <Button type="submit" loading={pending ?? status.pending} {...rest} />;
}
