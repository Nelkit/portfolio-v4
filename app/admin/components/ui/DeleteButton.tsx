'use client';

import { Button } from './Button';
import { useAsyncAction } from './hooks';

/**
 * Confirm, then call a delete server action that takes the `id` as FormData.
 * Shows "Deleting…" while pending and a toast with the outcome.
 */
export function DeleteButton({
	action,
	id,
	confirmMessage,
	success = 'Deleted',
	label = 'Delete',
	className,
	onDeleted,
}: {
	action: (data: FormData) => Promise<unknown>;
	id: number;
	confirmMessage: string;
	success?: string;
	label?: string;
	className?: string;
	onDeleted?: () => void;
}) {
	const { pending, run } = useAsyncAction();
	return (
		<Button
			variant="danger"
			className={className}
			loading={pending}
			loadingLabel="Deleting…"
			onClick={() => {
				if (!confirm(confirmMessage)) return;
				const data = new FormData();
				data.set('id', String(id));
				run(
					async () => {
						const result = await action(data);
						if (!(result as { error?: string } | undefined)?.error) onDeleted?.();
						return result;
					},
					{ success },
				);
			}}
		>
			{label}
		</Button>
	);
}
