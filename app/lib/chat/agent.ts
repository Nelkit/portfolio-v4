import { createOpenAI } from '@ai-sdk/openai';
import { convertToModelMessages, streamText } from 'ai';
import { Client } from '@notionhq/client';
import type { ChatMessage } from './chat-request';
import { withModelFallback } from './fallback-model';
import { createKnowledgeBase, readPage } from './knowledge-base';
import { chatModels } from './models';
import { responseLanguageRule } from './response-language';
import { buildSystemPrompt } from './system-prompt';

/** The portfolio agent: shared by the chat API and the evaluation script. */

export const readKnowledgeBase = createKnowledgeBase({
	ttlMs: 10 * 60 * 1000,
	retryMs: 30 * 1000,
	read: () => {
		const notion = new Client({ auth: process.env.NOTION_API_KEY });
		return readPage(
			async (block_id, start_cursor) => {
				const { results, next_cursor } = await notion.blocks.children.list({ block_id, start_cursor, page_size: 100 });
				// Partial blocks (no read access) carry no content.
				return { results: results.filter((b) => 'type' in b), next_cursor };
			},
			process.env.NOTION_PAGE_ID ?? '',
		);
	},
});

export async function streamAnswer({ messages, locale, primaryModel }: {
	messages: ChatMessage[];
	locale: unknown;
	/** Overrides OPENROUTER_MODEL (evaluation); then there is no fallback, so results are about one model. */
	primaryModel?: string;
}) {
	const openrouter = createOpenAI({ baseURL: 'https://openrouter.ai/api/v1', apiKey: process.env.OPENROUTER_API_KEY ?? '' });
	const { primary, fallback } = chatModels();
	let used = primaryModel ?? primary;
	const model = primaryModel
		? openrouter(primaryModel)
		: withModelFallback(openrouter(primary), openrouter(fallback), (status) => {
			console.warn(`Primary model failed (${status}), falling back to ${fallback}`);
			used = fallback;
		});

	const result = streamText({
		model,
		system: buildSystemPrompt(await readKnowledgeBase(), responseLanguageRule(locale)),
		messages: await convertToModelMessages(messages),
		// Reasoning models spend part of this before writing: 400 cut answers off mid-list.
		maxOutputTokens: 1_000,
		maxRetries: 1, // every retry is another paid call
		onError: ({ error }) => console.error(`Chat model ${used} failed:`, error instanceof Error ? error.message : error),
		onFinish: ({ text, finishReason }) => {
			if (!text.trim()) console.warn(`Empty answer from ${used} (finish reason: ${finishReason})`);
		},
	});
	return { result, usedModel: () => used };
}
