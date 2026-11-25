import { z } from 'zod';

/** Shared by the chat field (client) and the API (server). */
export const MAX_QUESTION_CHARS = 500;
/** Answers are capped at 400 output tokens, so real ones stay well below this. */
const MAX_ANSWER_CHARS = 4_000;
const MAX_MESSAGES = 6;
const MAX_BODY_CHARS = 64_000;

export type ChatMessage = { role: 'user' | 'assistant'; parts: [{ type: 'text'; text: string }] };

type LooseMessage = { role: string; parts: { type: string; text?: string }[] };

const textOf = (message: LooseMessage) =>
	message.parts.filter((p) => p.type === 'text').map((p) => p.text ?? '').join('');

/** What the client sends: the last messages, text only, within the server's limits. */
export function recentTextMessages(messages: LooseMessage[]) {
	return messages
		.slice(-MAX_MESSAGES)
		.map((m) => ({
			role: m.role,
			parts: [{ type: 'text', text: textOf(m).slice(0, m.role === 'user' ? MAX_QUESTION_CHARS : MAX_ANSWER_CHARS) }],
		}));
}

const bodySchema = z.object({
	locale: z.unknown().optional(),
	messages: z.array(
		z.object({
			// No 'system': visitors must not be able to add instructions.
			role: z.enum(['user', 'assistant']),
			parts: z.array(z.object({ type: z.string(), text: z.string().optional() })),
		}),
	),
});

/** Validates a chat request body; null when it must be rejected. */
export function parseChatRequest(raw: string): { locale: unknown; messages: ChatMessage[] } | null {
	if (raw.length > MAX_BODY_CHARS) return null;
	let json: unknown;
	try {
		json = JSON.parse(raw);
	} catch {
		return null;
	}
	const parsed = bodySchema.safeParse(json);
	if (!parsed.success) return null;

	const messages: ChatMessage[] = parsed.data.messages
		.slice(-MAX_MESSAGES)
		.map((m): ChatMessage => ({ role: m.role, parts: [{ type: 'text', text: textOf(m).trim() }] }));
	const last = messages.at(-1);
	if (!last || last.role !== 'user' || last.parts[0].text === '') return null;

	const tooLong = messages.some(
		(m) => m.parts[0].text.length > (m.role === 'user' ? MAX_QUESTION_CHARS : MAX_ANSWER_CHARS),
	);
	if (tooLong) return null;
	// An answer that failed midway has no text: leave it out.
	return { locale: parsed.data.locale, messages: messages.filter((m) => m.parts[0].text !== '') };
}
