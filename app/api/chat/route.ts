import { createOpenAI } from '@ai-sdk/openai';
import { streamText, convertToModelMessages } from 'ai';
import { Client } from '@notionhq/client';
import type { BlockObjectResponse } from '@notionhq/client/build/src/api-endpoints';
import { chatModels, modelLabel } from '@/app/lib/chat/models';
import type { ChatErrorCode } from '@/app/lib/chat/chat-error';
import { chatClientId, checkChatLimits, getChatLimiters } from '@/app/lib/chat/chat-limits';
import { parseChatRequest } from '@/app/lib/chat/chat-request';
import { withModelFallback } from '@/app/lib/chat/fallback-model';
import { clientIp } from '@/app/lib/rate-limit/rate-limiter';
import { responseLanguageRule } from '@/app/lib/chat/response-language';

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

	// Every type above stores its text as { rich_text: [{ plain_text }] } under its own key.
	const fields = block as unknown as Record<string, { rich_text?: { plain_text: string }[] } | undefined>;
	for (const type of richTextTypes) {
		const richText = fields[type]?.rich_text;
		if (block.type === type && richText) {
			const prefix = type === 'heading_1' ? '# '
				: type === 'heading_2' ? '## '
				: type === 'heading_3' ? '### '
				: type === 'bulleted_list_item' ? '- '
				: type === 'numbered_list_item' ? '1. '
				: '';
			return prefix + richText.map((r) => r.plain_text).join('');
		}
	}
	return '';
}

function buildSystemPrompt(knowledgeBase: string, languageRule: string): string {
	return `You are Nelkit's portfolio agent — a smart, concise assistant that answers questions about Nelkit Chavez based ONLY on the knowledge base below.

## How to read the conversation
- ALWAYS answer the user's MOST RECENT message. That single message is the question you must respond to.
- Treat earlier messages as context ONLY — use them to resolve references (e.g. "that project", "and its year?", "tell me more") in the latest message.
- If the latest message is a NEW, self-contained question, answer ONLY that. Do NOT repeat, continue, or re-answer a previous question.
- If the latest message and a previous answer are unrelated, ignore the previous topic entirely.

## Answering rules
- ${languageRule}
- Be direct and specific — no fluff
- Answer ONLY what was asked. Do not volunteer the project list or a tech-stack dump unless the latest message actually asks for it.
- If the answer is not in the knowledge base, say so plainly in ONE sentence (e.g. "I don't have that information") and suggest contacting Nelkit directly. Do NOT pad the gap by listing unrelated facts.
- Never make up facts, projects, or skills that are not listed
- Keep answers under 3 sentences unless a detailed breakdown is clearly needed
- For role/availability questions, be encouraging but accurate

## Output format (STRICT)
- Start your reply with the DIRECT answer to the latest question. The very first sentence must address what was asked — nothing before it.
- NEVER open with a recap, summary, or restatement of previous turns or previous answers (e.g. "I use a variety of tools...", "The Sydney Liveability AI project..."). Do not re-introduce earlier topics.
- Do NOT echo or paraphrase your own previous replies. Each answer stands on its own.
- No warm-up sentences. No "context" preamble. Lead with the answer, then add at most one supporting detail if useful.

Knowledge base:
---
${knowledgeBase}
---

Reminder: ${languageRule}`;
}

const { primary: PRIMARY_MODEL, fallback: FALLBACK_MODEL } = chatModels();

function chatError(status: number, body: { code: ChatErrorCode; retryAfterSeconds?: number }) {
	const headers = body.retryAfterSeconds ? { 'Retry-After': String(body.retryAfterSeconds) } : undefined;
	return Response.json(body, { status, headers });
}

export async function POST(req: Request) {
	// Cheapest checks first: an invalid request never reaches Redis or the model.
	const request = parseChatRequest(await req.text());
	if (!request) return chatError(400, { code: 'invalid' });

	const clientId = chatClientId(clientIp(req.headers), process.env.AUTH_SECRET ?? 'chat');
	const limit = await checkChatLimits(clientId, getChatLimiters());
	if (limit) return chatError(429, limit);

	let knowledgeBase = '';
	try {
		knowledgeBase = await fetchNotionContent();
	} catch (err) {
		console.error('Notion fetch failed:', err);
		knowledgeBase = 'Knowledge base temporarily unavailable.';
	}

	let usedModel = PRIMARY_MODEL;
	const model = withModelFallback(openrouter(PRIMARY_MODEL), openrouter(FALLBACK_MODEL), (status) => {
		console.warn(`Primary model failed (${status}), falling back to ${FALLBACK_MODEL}`);
		usedModel = FALLBACK_MODEL;
	});

	const result = streamText({
		model,
		system: buildSystemPrompt(knowledgeBase, responseLanguageRule(request.locale)),
		messages: await convertToModelMessages(request.messages),
		maxOutputTokens: 400,
		maxRetries: 1, // every retry is another paid call
	});

	// Sent when the answer ends: only then is it known which model produced it.
	return result.toUIMessageStreamResponse({
		messageMetadata: ({ part }) => (part.type === 'finish' ? { model: modelLabel(usedModel) } : undefined),
	});
}
