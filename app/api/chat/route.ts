import { createOpenAI } from '@ai-sdk/openai';
import { streamText, convertToModelMessages, UIMessage } from 'ai';
import { Client } from '@notionhq/client';
import type { BlockObjectResponse } from '@notionhq/client/build/src/api-endpoints';

export const maxDuration = 30;

const openrouter = createOpenAI({
	baseURL: 'https://openrouter.ai/api/v1',
	apiKey: process.env.OPENROUTER_API_KEY ?? '',
});

const notion = new Client({ auth: process.env.NOTION_API_KEY });

let notionCache: { content: string; at: number } | null = null;
const CACHE_TTL = 10 * 60 * 1000;

async function fetchNotionContent(): Promise<string> {
	if (notionCache && Date.now() - notionCache.at < CACHE_TTL) {
		return notionCache.content;
	}

	const pageId = process.env.NOTION_PAGE_ID ?? '';
	const blocks = await notion.blocks.children.list({ block_id: pageId, page_size: 100 });

	const lines: string[] = [];
	for (const block of blocks.results) {
		const text = extractText(block as BlockObjectResponse);
		if (text) lines.push(text);
	}

	const content = lines.join('\n');
	notionCache = { content, at: Date.now() };
	return content;
}

function extractText(block: BlockObjectResponse): string {
	const richTextTypes = [
		'paragraph', 'heading_1', 'heading_2', 'heading_3',
		'bulleted_list_item', 'numbered_list_item', 'quote', 'callout',
	] as const;

	for (const type of richTextTypes) {
		const b = block as any;
		if (b.type === type && b[type]?.rich_text) {
			const prefix = type === 'heading_1' ? '# '
				: type === 'heading_2' ? '## '
				: type === 'heading_3' ? '### '
				: type === 'bulleted_list_item' ? '- '
				: type === 'numbered_list_item' ? '1. '
				: '';
			return prefix + b[type].rich_text.map((r: any) => r.plain_text).join('');
		}
	}
	return '';
}

function buildSystemPrompt(knowledgeBase: string): string {
	return `You are Nelkit's portfolio agent — a smart, concise assistant that answers questions about Nelkit Chavez based ONLY on the knowledge base below.

Rules:
- Answer in the same language the user writes in (Spanish or English)
- Be direct and specific — no fluff
- If the answer is not in the knowledge base, say so honestly and suggest contacting Nelkit directly
- Never make up facts, projects, or skills that are not listed
- Keep answers under 3 sentences unless a detailed breakdown is clearly needed
- For role/availability questions, be encouraging but accurate

Knowledge base:
---
${knowledgeBase}
---`;
}

const PRIMARY_MODEL = process.env.OPENROUTER_MODEL ?? 'google/gemini-2.5-flash-lite';
const FALLBACK_MODEL = process.env.OPENROUTER_FALLBACK_MODEL ?? 'nvidia/nemotron-3-super-120b-a12b:free';

async function runStream(model: string, system: string, messages: Awaited<ReturnType<typeof convertToModelMessages>>) {
	return streamText({
		model: openrouter(model),
		system,
		messages,
		maxOutputTokens: 400,
	});
}

export async function POST(req: Request) {
	const body = await req.json();
	const messages: UIMessage[] = body.messages ?? [];

	// Keep only the last 6 messages to stay within free-tier context limits
	const recentMessages = messages.slice(-6);

	let knowledgeBase = '';
	try {
		knowledgeBase = await fetchNotionContent();
	} catch (err) {
		console.error('Notion fetch failed:', err);
		knowledgeBase = 'Knowledge base temporarily unavailable.';
	}

	const modelMessages = await convertToModelMessages(recentMessages);
	const system = buildSystemPrompt(knowledgeBase);

	try {
		const result = await runStream(PRIMARY_MODEL, system, modelMessages);
		return result.toUIMessageStreamResponse();
	} catch (err) {
		// 402 = payment required / credits exhausted; 429 = rate limit
		const e = err as { statusCode?: number; status?: number };
		const status = e?.statusCode ?? e?.status ?? 0;
		if (status === 402 || status === 429) {
			console.warn(`Primary model failed (${status}), falling back to ${FALLBACK_MODEL}`);
			const result = await runStream(FALLBACK_MODEL, system, modelMessages);
			return result.toUIMessageStreamResponse();
		}
		throw err;
	}
}
