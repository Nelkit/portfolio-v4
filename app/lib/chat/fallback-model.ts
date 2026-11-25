import { APICallError, wrapLanguageModel } from 'ai';

type Model = Parameters<typeof wrapLanguageModel>[0]['model'];

/** 402 = credits exhausted, 429 = rate limited by the provider. */
const FALLBACK_STATUSES = [402, 429];

/**
 * Answers with `fallback` when `primary` is out of credits or rate limited.
 * It must wrap the model: streamText does not throw on provider errors, it puts
 * them in the stream, so a try/catch around it never runs.
 */
export function withModelFallback(primary: Model, fallback: Model, onFallback: (status: number) => void) {
	return wrapLanguageModel({
		model: primary,
		middleware: {
			specificationVersion: 'v3',
			async wrapStream({ doStream, params }) {
				try {
					return await doStream();
				} catch (error) {
					const status = APICallError.isInstance(error) ? error.statusCode : undefined;
					if (status === undefined || !FALLBACK_STATUSES.includes(status)) throw error;
					onFallback(status);
					return (fallback as Exclude<Model, string>).doStream(params);
				}
			},
		},
	});
}
