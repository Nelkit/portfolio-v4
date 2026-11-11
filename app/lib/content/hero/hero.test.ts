import { describe, expect, it } from 'vitest';
import { parseHeadlineInput, parseHeroForm, HEADLINE_MAX_LENGTH } from './hero';

describe('parseHeroForm', () => {
	it('accepts a headline for every locale', () => {
		const result = parseHeroForm({ headline_en: ' Hello ', headline_es: ' Hola ' });
		expect(result).toEqual({ ok: true, headlines: { en: 'Hello', es: 'Hola' } });
	});

	it('reports which locale is invalid', () => {
		const result = parseHeroForm({ headline_en: 'Hello', headline_es: '   ' });
		expect(result.ok).toBe(false);
		if (!result.ok) {
			expect(Object.keys(result.errors)).toEqual(['es']);
		}
	});

	it('rejects a missing locale field', () => {
		const result = parseHeroForm({ headline_en: 'Hello' });
		expect(result.ok).toBe(false);
	});
});

describe('parseHeadlineInput', () => {
	it('accepts and trims a valid headline', () => {
		const result = parseHeadlineInput('  Building <em>AI products</em> that ship  ');
		expect(result).toEqual({ ok: true, headline: 'Building <em>AI products</em> that ship' });
	});

	it('rejects an empty or whitespace-only headline', () => {
		expect(parseHeadlineInput('').ok).toBe(false);
		expect(parseHeadlineInput('   ').ok).toBe(false);
	});

	it('rejects non-string input', () => {
		expect(parseHeadlineInput(null).ok).toBe(false);
		expect(parseHeadlineInput(42).ok).toBe(false);
	});

	it(`rejects a headline longer than ${HEADLINE_MAX_LENGTH} characters`, () => {
		expect(parseHeadlineInput('a'.repeat(HEADLINE_MAX_LENGTH)).ok).toBe(true);
		expect(parseHeadlineInput('a'.repeat(HEADLINE_MAX_LENGTH + 1)).ok).toBe(false);
	});
});
