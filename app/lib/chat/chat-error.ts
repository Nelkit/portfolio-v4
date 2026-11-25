export const CHAT_ERROR_CODES = ['minute', 'day', 'global', 'invalid', 'failed'] as const;
export type ChatErrorCode = (typeof CHAT_ERROR_CODES)[number];

/** Reads the JSON error body of the chat API (useChat exposes it as error.message). */
export function parseChatError(raw: string): { code: ChatErrorCode; minutes: number } {
	let body: { code?: unknown; retryAfterSeconds?: unknown } | null = null;
	try {
		body = JSON.parse(raw);
	} catch {
		// not ours: network or stream error
	}
	const code = CHAT_ERROR_CODES.find((c) => c === body?.code) ?? 'failed';
	const seconds = typeof body?.retryAfterSeconds === 'number' ? body.retryAfterSeconds : 0;
	return { code, minutes: Math.max(1, Math.ceil(seconds / 60)) };
}
