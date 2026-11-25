import { describe, expect, it, vi } from 'vitest';
import { createOpenAI } from '@ai-sdk/openai';
import { streamText } from 'ai';
import { withModelFallback } from './fallback-model';

const failing = (status: number) => createOpenAI({
	apiKey: 'x',
	fetch: async () => new Response('{"error":{"message":"no"}}', { status, headers: { 'content-type': 'application/json' } }),
})('primary');
const working = createOpenAI({
	apiKey: 'x',
	fetch: async () => new Response(
		[
			{ type: 'response.created', response: { id: 'r', created_at: 1, model: 'fallback' } },
			{ type: 'response.output_item.added', output_index: 0, item: { type: 'message', id: 'i' } },
			{ type: 'response.output_text.delta', item_id: 'i', delta: 'hello' },
			{ type: 'response.output_item.done', output_index: 0, item: { type: 'message', id: 'i' } },
			{ type: 'response.completed', response: { usage: { input_tokens: 1, output_tokens: 1 } } },
		].map((e) => `data: ${JSON.stringify(e)}\n\n`).join(''),
		{ headers: { 'content-type': 'text/event-stream' } },
	),
})('fallback');

const run = (model: Parameters<typeof streamText>[0]['model']) =>
	streamText({ model, prompt: 'hi', maxRetries: 0, onError: () => {} }).toUIMessageStreamResponse().text();

describe('withModelFallback', () => {
	it('documents the bug: streamText does not throw on 402, the error goes into the stream', async () => {
		expect(await run(failing(402))).toContain('"type":"error"');
	});

	it.each([402, 429])('answers with the fallback model on %s', async (status) => {
		const onFallback = vi.fn();
		const body = await run(withModelFallback(failing(status), working, onFallback));
		expect(body).toContain('hello');
		expect(onFallback).toHaveBeenCalledWith(status);
	});

	it('does not hide other errors', async () => {
		const onFallback = vi.fn();
		expect(await run(withModelFallback(failing(400), working, onFallback))).toContain('"type":"error"');
		expect(onFallback).not.toHaveBeenCalled();
	});
});
