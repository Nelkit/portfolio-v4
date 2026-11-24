/**
 * The single source of the chat models (OPENROUTER_MODEL / OPENROUTER_FALLBACK_MODEL),
 * shared by the chat API and the hero, which shows the model label before the
 * first answer arrives. Model names are not secret; the API key stays server-only.
 */

const DEFAULT_PRIMARY = 'openai/gpt-oss-120b';
const DEFAULT_FALLBACK = 'openai/gpt-oss-120b:free';

type ModelEnv = Record<string, string | undefined>;

export function chatModels(env: ModelEnv = process.env): { primary: string; fallback: string } {
	return {
		primary: env.OPENROUTER_MODEL?.trim() || DEFAULT_PRIMARY,
		fallback: env.OPENROUTER_FALLBACK_MODEL?.trim() || DEFAULT_FALLBACK,
	};
}

/** Clean UI label from an OpenRouter slug: "openai/gpt-oss-120b:free" → "gpt-oss-120b". */
export function modelLabel(slug: string): string {
	return (slug.split('/').pop() ?? slug).replace(/:.*$/, '');
}
