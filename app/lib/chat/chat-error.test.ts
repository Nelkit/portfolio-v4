import { describe, expect, it } from 'vitest';
import { parseChatError } from './chat-error';

describe('parseChatError', () => {
	it('reads the limit and the wait in minutes, rounded up', () => {
		expect(parseChatError('{"code":"minute","retryAfterSeconds":61}')).toEqual({ code: 'minute', minutes: 2 });
		expect(parseChatError('{"code":"day","retryAfterSeconds":1}')).toEqual({ code: 'day', minutes: 1 });
		expect(parseChatError('{"code":"invalid"}')).toEqual({ code: 'invalid', minutes: 1 });
	});
	it('treats anything else as a generic failure', () => {
		for (const raw of ['An error occurred.', '{"code":"toString"}', 'null', '']) {
			expect(parseChatError(raw).code).toBe('failed');
		}
	});
});
