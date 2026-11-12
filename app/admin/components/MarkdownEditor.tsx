'use client';

import { useState } from 'react';
import { Markdown } from '@/app/components/Markdown';

/** Markdown textarea with a Write / Preview toggle (same renderer as the public site). */
export function MarkdownEditor({
	name,
	defaultValue,
	lang,
	rows = 12,
	invalid,
}: {
	name: string;
	defaultValue: string;
	lang?: string;
	rows?: number;
	invalid?: boolean;
}) {
	const [value, setValue] = useState(defaultValue);
	const [preview, setPreview] = useState(false);
	const tab = (on: boolean) => `px-3 py-1 text-sm ${on ? 'border-b-2 border-ui-accent' : 'text-ui-faint'}`;

	return (
		<div className="flex flex-col gap-2">
			<div className="flex gap-2">
				<button type="button" className={tab(!preview)} onClick={() => setPreview(false)}>Write</button>
				<button type="button" className={tab(preview)} onClick={() => setPreview(true)}>Preview</button>
			</div>
			{/* The textarea stays mounted (hidden in preview) so the value is always submitted. */}
			<textarea
				name={name}
				lang={lang}
				rows={rows}
				value={value}
				onChange={(e) => setValue(e.target.value)}
				aria-invalid={invalid}
				hidden={preview}
				className="w-full rounded border border-ui-border-2 bg-ui-surface px-3 py-2 font-mono text-sm outline-none focus:border-ui-accent aria-invalid:border-red-500"
			/>
			{preview && (
				<div className="prose-admin min-h-24 rounded border border-ui-border p-4 text-sm leading-relaxed [&_a]:underline [&_code]:text-emerald-300 [&_h2]:mt-4 [&_h2]:text-lg [&_h2]:font-semibold [&_h3]:mt-3 [&_h3]:font-semibold [&_li]:ml-5 [&_ol]:list-decimal [&_p]:my-2 [&_pre]:overflow-x-auto [&_pre]:rounded [&_pre]:bg-ui-surface [&_pre]:p-3 [&_ul]:list-disc">
					{value.trim() ? <Markdown>{value}</Markdown> : <p className="text-ui-faint">Nothing to preview.</p>}
				</div>
			)}
		</div>
	);
}
