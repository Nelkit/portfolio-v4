/**
 * Asks the portfolio agent real questions and checks key facts in the answers.
 * Every question is a paid model call. Does not go through the chat's usage limits.
 *
 *   pnpm chat:eval                                        → OPENROUTER_MODEL of .env
 *   pnpm chat:eval --model google/gemini-2.5-flash-lite   → another model, to compare
 *   pnpm chat:eval --only cv                              → only the ids that contain "cv"
 */
import { createRequire } from 'node:module';

const { loadEnvConfig } = createRequire(import.meta.url)('@next/env') as typeof import('@next/env');
loadEnvConfig(process.cwd(), true, { info: () => {}, error: console.error });

function option(name: string): string | undefined {
	const i = process.argv.indexOf(`--${name}`);
	if (i < 0) return undefined;
	const value = process.argv[i + 1];
	if (!value || value.startsWith('--')) throw new Error(`--${name} needs a value`);
	return value;
}

async function main() {
	const { readKnowledgeBase, streamAnswer } = await import('@/app/lib/chat/agent');
	const { chatModels } = await import('@/app/lib/chat/models');
	const { CASES } = await import('./cases');
	const { checkAnswer } = await import('./check');

	const only = option('only');
	const primaryModel = option('model') ?? chatModels().primary;
	const cases = CASES.filter((c) => !only || c.id.includes(only));
	if (cases.length === 0) throw new Error(`No case contains "${only}".`);

	const knowledge = await readKnowledgeBase();
	if (!knowledge) throw new Error('The knowledge base could not be read: results would mean nothing.');
	console.log(`Model: ${primaryModel} · knowledge base: ${knowledge.length} characters · ${cases.length} questions\n`);

	let passed = 0;
	let errors = 0; // the provider failed: says nothing about the answers
	let inputTokens = 0;
	let outputTokens = 0;
	for (const c of cases) {
		let answer = '';
		let problems: string[];
		try {
			let failure: unknown;
			const { result } = await streamAnswer({ messages: c.messages, locale: c.locale, primaryModel });
			for await (const part of result.fullStream) {
				if (part.type === 'text-delta') answer += part.text;
				if (part.type === 'error') failure = part.error;
			}
			if (failure) throw failure;
			const usage = await result.usage;
			inputTokens += usage.inputTokens ?? 0;
			outputTokens += usage.outputTokens ?? 0;
			problems = checkAnswer(answer, c);
		} catch (error) {
			errors += 1;
			console.log(`ERROR ${c.id}: ${error instanceof Error ? error.message : error}`);
			continue;
		}
		if (problems.length === 0) passed += 1;
		console.log(`${problems.length === 0 ? 'PASS' : 'FAIL'} ${c.id}`);
		if (problems.length > 0 || only) console.log(`     ${problems.join('; ')}\n     Answer: ${answer.trim()}`);
	}
	console.log(`\n${passed} passed, ${cases.length - passed - errors} failed, ${errors} provider errors · ${inputTokens} input and ${outputTokens} output tokens`);
	if (passed < cases.length) process.exitCode = 1;
}

main().catch((error) => {
	console.error(error instanceof Error ? error.message : error);
	process.exitCode = 1;
});
