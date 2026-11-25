import { describe, expect, it } from 'vitest';
import { appendTranscript, voiceErrorFor } from './voice-transcript';

describe('appendTranscript', () => {
	it('uses the transcript alone when the field is empty', () => {
		expect(appendTranscript('', ' hola mundo ')).toBe('hola mundo');
	});

	it('adds it after the typed text with a single space', () => {
		expect(appendTranscript('Tell me', 'about Horus')).toBe('Tell me about Horus');
		expect(appendTranscript('Tell me ', ' about Horus')).toBe('Tell me about Horus');
	});

	it('keeps the typed text when nothing was heard', () => {
		expect(appendTranscript('Tell me', '  ')).toBe('Tell me');
	});
});

describe('voiceErrorFor', () => {
	it.each([
		['not-allowed', 'denied'],
		['service-not-allowed', 'denied'],
		['audio-capture', 'noMic'],
		['no-speech', 'noSpeech'],
		['network', 'failed'],
		['anything-else', 'failed'],
		['aborted', null],
	])('%s → %s', (code, expected) => {
		expect(voiceErrorFor(code)).toBe(expected);
	});
});
