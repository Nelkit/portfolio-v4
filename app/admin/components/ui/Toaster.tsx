'use client';

import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';

type ToastKind = 'success' | 'error';
type Toast = { id: number; kind: ToastKind; message: string };
type ToastApi = { success: (message: string) => void; error: (message: string) => void };

const ToastContext = createContext<ToastApi | null>(null);

/** Success toasts fade quickly; errors stay longer so they can be read. */
const DURATION: Record<ToastKind, number> = { success: 3500, error: 8000 };

/** The single toast system of the admin (mounted once in the admin layout). */
export function ToastProvider({ children }: { children: React.ReactNode }) {
	const [toasts, setToasts] = useState<Toast[]>([]);
	const nextId = useRef(0);

	const dismiss = useCallback((id: number) => setToasts((list) => list.filter((t) => t.id !== id)), []);

	const push = useCallback(
		(kind: ToastKind, message: string) => {
			const id = ++nextId.current;
			setToasts((list) => [...list, { id, kind, message }]);
			setTimeout(() => dismiss(id), DURATION[kind]);
		},
		[dismiss],
	);

	const api = useMemo<ToastApi>(
		() => ({ success: (m) => push('success', m), error: (m) => push('error', m) }),
		[push],
	);

	return (
		<ToastContext.Provider value={api}>
			{children}
			<div className="pointer-events-none fixed bottom-4 right-4 z-50 flex w-80 flex-col gap-2">
				{toasts.map((t) => (
					<div
						key={t.id}
						role={t.kind === 'error' ? 'alert' : 'status'}
						className={`pointer-events-auto flex items-start gap-3 rounded border bg-ui-surface px-4 py-3 text-sm shadow-lg ${
							t.kind === 'error' ? 'border-red-500 text-red-300' : 'border-emerald-500 text-emerald-300'
						}`}
					>
						<span className="flex-1">{t.message}</span>
						<button type="button" onClick={() => dismiss(t.id)} className="text-ui-faint hover:text-ui-text" aria-label="Dismiss">✕</button>
					</div>
				))}
			</div>
		</ToastContext.Provider>
	);
}

export function useToast(): ToastApi {
	const api = useContext(ToastContext);
	if (!api) throw new Error('useToast must be used inside <ToastProvider>');
	return api;
}
