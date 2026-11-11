'use client';

import { useId, useState } from 'react';

/**
 * Ordered tag editor: type and press Enter (or comma) to add, ✕ to remove,
 * ←/→ to reorder. Suggestions come from a <datalist>. Submits the list as JSON
 * in a hidden input named `name`.
 */
export function TagsInput({
	name,
	initial,
	suggestions = [],
	placeholder = 'Type and press Enter',
	error,
}: {
	name: string;
	initial: string[];
	suggestions?: string[];
	placeholder?: string;
	error?: string;
}) {
	const [tags, setTags] = useState(initial);
	const [draft, setDraft] = useState('');
	const listId = useId();

	const add = (raw: string) => {
		const value = raw.trim();
		if (!value) return;
		// Case-insensitive duplicates are ignored (the server dedupes too).
		if (!tags.some((t) => t.toLowerCase() === value.toLowerCase())) setTags((c) => [...c, value]);
		setDraft('');
	};
	const move = (index: number, delta: -1 | 1) =>
		setTags((current) => {
			const target = index + delta;
			if (target < 0 || target >= current.length) return current;
			const next = [...current];
			[next[index], next[target]] = [next[target], next[index]];
			return next;
		});

	return (
		<div className="flex flex-col gap-2">
			<input type="hidden" name={name} value={JSON.stringify(tags)} />
			<div className="flex flex-wrap gap-2">
				{tags.map((tag, index) => (
					<span key={tag} className="flex items-center gap-1 rounded bg-zinc-800 px-2 py-1 text-sm">
						<button type="button" onClick={() => move(index, -1)} disabled={index === 0} className="text-zinc-500 disabled:opacity-30" aria-label={`Move ${tag} left`}>‹</button>
						{tag}
						<button type="button" onClick={() => move(index, 1)} disabled={index === tags.length - 1} className="text-zinc-500 disabled:opacity-30" aria-label={`Move ${tag} right`}>›</button>
						<button type="button" onClick={() => setTags((c) => c.filter((t) => t !== tag))} className="ml-1 text-red-400" aria-label={`Remove ${tag}`}>✕</button>
					</span>
				))}
			</div>
			<input
				value={draft}
				list={listId}
				placeholder={placeholder}
				onChange={(e) => {
					const value = e.target.value;
					if (value.endsWith(',')) add(value.slice(0, -1));
					else setDraft(value);
				}}
				onKeyDown={(e) => {
					if (e.key === 'Enter') {
						e.preventDefault(); // Enter adds a tag instead of submitting the form
						add(draft);
					}
				}}
				onBlur={() => add(draft)}
				className="rounded border border-zinc-700 bg-zinc-900 px-3 py-2 outline-none focus:border-zinc-400"
			/>
			<datalist id={listId}>
				{suggestions.filter((s) => !tags.some((t) => t.toLowerCase() === s.toLowerCase())).map((s) => <option key={s} value={s} />)}
			</datalist>
			{error && <span className="text-sm text-red-400">{error}</span>}
		</div>
	);
}
