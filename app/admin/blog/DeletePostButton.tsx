'use client';

/** Submit button that asks for confirmation before deleting a post. */
export function DeletePostButton({ title }: { title: string }) {
	return (
		<button
			type="submit"
			className="text-sm text-red-400"
			onClick={(e) => {
				if (!confirm(`Delete “${title}”? This cannot be undone.`)) e.preventDefault();
			}}
		>
			Delete
		</button>
	);
}
