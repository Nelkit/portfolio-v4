export type Expectation = {
	/** Every pattern must appear in the answer. */
	expect?: RegExp[];
	/** None of these may appear. */
	forbid?: RegExp[];
};

/** Problems found in an answer; empty when it passes. */
export function checkAnswer(answer: string, { expect = [], forbid = [] }: Expectation): string[] {
	if (!answer.trim()) return ['empty answer'];
	return [
		...expect.filter((r) => !r.test(answer)).map((r) => `missing ${r}`),
		...forbid.filter((r) => r.test(answer)).map((r) => `forbidden ${r}`),
	];
}
