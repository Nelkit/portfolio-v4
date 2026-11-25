import { describe, expect, it } from 'vitest';
import { checkAnswer } from './check';
import { CASES } from './cases';

describe('checkAnswer', () => {
	it('passes when everything expected is there and nothing forbidden is', () => {
		expect(checkAnswer('Yes, remote or hybrid.', { expect: [/remote/i, /hybrid/i], forbid: [/no information/i] })).toEqual([]);
	});
	it('lists what is missing or forbidden', () => {
		expect(checkAnswer('I do not know', { expect: [/remote/i], forbid: [/do not know/i] })).toEqual(['missing /remote/i', 'forbidden /do not know/i']);
	});
	it('fails an empty answer', () => {
		expect(checkAnswer('  ', {})).toEqual(['empty answer']);
	});
});

describe('CASES', () => {
	it('have unique ids and end with a user question', () => {
		expect(new Set(CASES.map((c) => c.id)).size).toBe(CASES.length);
		for (const c of CASES) expect(c.messages.at(-1)?.role).toBe('user');
	});
});
