import { describe, expect, it } from 'vitest';
import { buildSystemPrompt } from './system-prompt';

describe('buildSystemPrompt', () => {
	it('includes the knowledge base, and the language rule before and after it', () => {
		const prompt = buildSystemPrompt('KB-CONTENT', 'LANG-RULE');
		expect(prompt.indexOf('LANG-RULE')).toBeLessThan(prompt.indexOf('KB-CONTENT'));
		expect(prompt.lastIndexOf('LANG-RULE')).toBeGreaterThan(prompt.indexOf('KB-CONTENT'));
	});
	it('tells the agent when the knowledge base could not be read', () => {
		expect(buildSystemPrompt(null, 'x')).toContain('Temporarily unavailable');
	});
});
