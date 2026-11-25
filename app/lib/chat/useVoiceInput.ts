'use client';

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react';
import type { Locale } from '@/app/lib/i18n/locales';
import { appendTranscript, voiceErrorFor, type VoiceError } from './voice-transcript';

/** The part of the Web Speech API used here (TypeScript's DOM types do not include it). */
type Recognition = {
	lang: string;
	continuous: boolean;
	interimResults: boolean;
	onresult: ((event: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
	onerror: ((event: { error: string }) => void) | null;
	onend: (() => void) | null;
	start(): void;
	stop(): void;
	abort(): void;
};
type RecognitionClass = new () => Recognition;

const SPEECH_LANG: Record<Locale, string> = { en: 'en-US', es: 'es-ES' };

function recognitionClass(): RecognitionClass | undefined {
	const w = window as unknown as { SpeechRecognition?: RecognitionClass; webkitSpeechRecognition?: RecognitionClass };
	return w.SpeechRecognition ?? w.webkitSpeechRecognition;
}

const noSubscription = () => () => {};

/**
 * Dictation into a text field with the browser's own speech recognition.
 * Listens to one utterance per start and stops at a pause: continuous mode
 * repeats words on Android Chrome. `supported` is false on the server and in
 * browsers without the API (e.g. Firefox).
 */
export function useVoiceInput(locale: Locale, onText: (text: string) => void) {
	const supported = useSyncExternalStore(noSubscription, () => Boolean(recognitionClass()), () => false);
	const [listening, setListening] = useState(false);
	const [error, setError] = useState<VoiceError | null>(null);
	const active = useRef<Recognition | null>(null);

	/** Stops at once and ignores anything still being recognized. */
	const cancel = useCallback(() => {
		const recognition = active.current;
		active.current = null;
		recognition?.abort();
		setListening(false);
		setError(null);
	}, []);

	/** Stops listening but keeps the final result of what was said. */
	const stop = useCallback(() => active.current?.stop(), []);

	const start = useCallback((typed: string) => {
		const Recognition = recognitionClass();
		if (!Recognition || active.current) return;

		const recognition = new Recognition();
		recognition.lang = SPEECH_LANG[locale];
		recognition.continuous = false;
		recognition.interimResults = true;
		// Events of a cancelled recognition are ignored.
		const isActive = () => active.current === recognition;
		recognition.onresult = ({ results }) => {
			if (!isActive()) return;
			onText(appendTranscript(typed, Array.from(results, (r) => r[0].transcript).join('')));
		};
		recognition.onerror = (event) => {
			if (isActive()) setError(voiceErrorFor(event.error));
		};
		recognition.onend = () => {
			if (!isActive()) return;
			active.current = null;
			setListening(false);
		};

		setError(null);
		active.current = recognition;
		try {
			recognition.start();
			setListening(true);
		} catch {
			active.current = null;
			setError('failed');
		}
	}, [locale, onText]);

	// Never leave the microphone open after the chat unmounts.
	useEffect(() => () => {
		const recognition = active.current;
		active.current = null;
		recognition?.abort();
	}, []);

	return { supported, listening, error, start, stop, cancel };
}
