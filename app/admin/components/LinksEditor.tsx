'use client';

import { useState } from 'react';
import { LINK_TYPES, MAX_LINKS, type Link } from '@/app/lib/content/links';

/**
 * Ordered list editor for links. Submits the list as JSON in a hidden input
 * named `name`; the server validates it with parseLinks().
 */
export function LinksEditor({ name = 'links', initial, error }: { name?: string; initial: Link[]; error?: string }) {
	const [links, setLinks] = useState<Link[]>(initial);

	const update = (index: number, patch: Partial<Link>) =>
		setLinks((current) => current.map((l, i) => (i === index ? { ...l, ...patch } : l)));
	const move = (index: number, delta: -1 | 1) =>
		setLinks((current) => {
			const target = index + delta;
			if (target < 0 || target >= current.length) return current;
			const next = [...current];
			[next[index], next[target]] = [next[target], next[index]];
			return next;
		});

	return (
		<div className="flex flex-col gap-3">
			<input type="hidden" name={name} value={JSON.stringify(links)} />
			{links.map((link, index) => (
				<div key={index} className="flex flex-wrap items-center gap-2">
					<select
						value={link.type}
						onChange={(e) => update(index, { type: e.target.value as Link['type'] })}
						className="rounded border border-ui-border-2 bg-ui-surface px-2 py-2"
						aria-label="Link type"
					>
						{LINK_TYPES.map((type) => <option key={type} value={type}>{type}</option>)}
					</select>
					<input
						value={link.label}
						onChange={(e) => update(index, { label: e.target.value })}
						placeholder="Label"
						aria-label="Link label"
						className="w-32 rounded border border-ui-border-2 bg-ui-surface px-3 py-2"
					/>
					<input
						value={link.url}
						onChange={(e) => update(index, { url: e.target.value })}
						placeholder={link.type === 'email' ? 'you@example.com' : 'https://…'}
						aria-label="Link URL"
						className="min-w-48 flex-1 rounded border border-ui-border-2 bg-ui-surface px-3 py-2"
					/>
					<button type="button" onClick={() => move(index, -1)} disabled={index === 0} className="px-2 text-ui-dim disabled:opacity-30" aria-label="Move up">↑</button>
					<button type="button" onClick={() => move(index, 1)} disabled={index === links.length - 1} className="px-2 text-ui-dim disabled:opacity-30" aria-label="Move down">↓</button>
					<button type="button" onClick={() => setLinks((c) => c.filter((_, i) => i !== index))} className="px-2 text-red-400" aria-label="Remove link">✕</button>
				</div>
			))}
			<div>
				<button
					type="button"
					disabled={links.length >= MAX_LINKS}
					onClick={() => setLinks((c) => [...c, { type: 'link', label: '', url: '' }])}
					className="rounded border border-ui-border-2 px-3 py-1 text-sm disabled:opacity-30"
				>
					+ Add link
				</button>
			</div>
			{error && <span className="text-sm text-red-400">{error}</span>}
		</div>
	);
}
