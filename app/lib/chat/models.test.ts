import { describe, expect, it } from 'vitest';
import { chatModels, modelLabel } from './models';

describe('chatModels', () => {
	it('reads the primary and fallback models from the environment', () => {
		expect(chatModels({ OPENROUTER_MODEL: 'anthropic/claude-sonnet-5-5', OPENROUTER_FALLBACK_MODEL: 'x/y:free' })).toEqual({
			primary: 'anthropic/claude-sonnet-5-5',
			fallback: 'x/y:free',
		});
	});

	it('uses the defaults when the variables are missing or blank', () => {
		const defaults = { primary: 'openai/gpt-oss-120b', fallback: 'openai/gpt-oss-120b:free' };
		expect(chatModels({})).toEqual(defaults);
		expect(chatModels({ OPENROUTER_MODEL: '  ', OPENROUTER_FALLBACK_MODEL: '' })).toEqual(defaults);
	});
});

describe('modelLabel', () => {
	it('drops the provider prefix and the variant suffix', () => {
		expect(modelLabel('openai/gpt-oss-120b:free')).toBe('gpt-oss-120b');
		expect(modelLabel('anthropic/claude-sonnet-5-5')).toBe('claude-sonnet-5-5');
		expect(modelLabel('gpt-4o')).toBe('gpt-4o');
	});
});
