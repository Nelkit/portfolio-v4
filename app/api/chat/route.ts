import { streamAnswer } from '@/app/lib/chat/agent';
import type { ChatErrorCode } from '@/app/lib/chat/chat-error';
import { chatClientId, checkChatLimits, getChatLimiters } from '@/app/lib/chat/chat-limits';
import { parseChatRequest } from '@/app/lib/chat/chat-request';
import { modelLabel } from '@/app/lib/chat/models';
import { clientIp } from '@/app/lib/rate-limit/rate-limiter';

export const maxDuration = 30;

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

	const { result, usedModel } = await streamAnswer(request);

	// Sent when the answer ends: only then is it known which model produced it.
	return result.toUIMessageStreamResponse({
		messageMetadata: ({ part }) => (part.type === 'finish' ? { model: modelLabel(usedModel()) } : undefined),
	});
}
