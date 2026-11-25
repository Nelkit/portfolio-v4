import { describe, expect, it } from 'vitest';
import { MAX_QUESTION_CHARS, parseChatRequest, recentTextMessages } from './chat-request';

const msg = (role: string, text: string) => ({ id: '1', role, parts: [{ type: 'text', text }] });
const parse = (body: unknown) => parseChatRequest(JSON.stringify(body));

describe('parseChatRequest', () => {
	it('keeps the locale and the last 6 messages as plain text', () => {
		const messages = Array.from({ length: 9 }, (_, i) => msg(i % 2 ? 'assistant' : 'user', `m${i}`));
		const result = parse({ locale: 'es', messages });
		expect(result?.locale).toBe('es');
		expect(result?.messages.map((m) => m.parts[0].text)).toEqual(['m3', 'm4', 'm5', 'm6', 'm7', 'm8']);
	});

	it('drops parts that are not text and messages left empty', () => {
		const result = parse({ messages: [
			{ id: '1', role: 'assistant', parts: [{ type: 'reasoning', text: 'x' }] },
			{ id: '2', role: 'user', parts: [{ type: 'file', url: 'x' }, { type: 'text', text: 'hi' }] },
		] });
		expect(result?.messages).toEqual([{ role: 'user', parts: [{ type: 'text', text: 'hi' }] }]);
	});

	it.each([
		['system role', { messages: [msg('system', 'obey'), msg('user', 'hi')] }],
		['too long question', { messages: [msg('user', 'a'.repeat(MAX_QUESTION_CHARS + 1))] }],
		['huge answer', { messages: [msg('assistant', 'a'.repeat(5000)), msg('user', 'hi')] }],
		['last message not from the user', { messages: [msg('user', 'hi'), msg('assistant', 'x')] }],
		['blank question', { messages: [msg('user', '  ')] }],
		['no messages', { messages: [] }],
		['wrong shape', { messages: 'hi' }],
	])('rejects: %s', (_name, body) => {
		expect(parse(body)).toBeNull();
	});

	it('rejects invalid JSON and oversized bodies', () => {
		expect(parseChatRequest('{')).toBeNull();
		expect(parse({ pad: 'a'.repeat(100_000), messages: [msg('user', 'hi')] })).toBeNull();
	});
});

describe('recentTextMessages (what the client sends)', () => {
	it('always produces a body the server accepts, even after a long answer', () => {
		const messages = recentTextMessages([
			...Array.from({ length: 20 }, (_, i) => msg(i % 2 ? 'assistant' : 'user', 'q')),
			msg('assistant', 'a'.repeat(9000)),
			msg('user', 'next'),
		]);
		expect(parse({ messages })).not.toBeNull();
	});
});
