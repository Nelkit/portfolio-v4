export type VoiceError = 'denied' | 'noMic' | 'noSpeech' | 'failed';

/** Puts what was heard after the text already in the field. */
export function appendTranscript(typed: string, heard: string): string {
	const text = heard.trim();
	if (!text) return typed;
	const base = typed.trimEnd();
	return base ? `${base} ${text}` : text;
}

/** Maps a SpeechRecognition error code to a message key; null when there is nothing to report. */
export function voiceErrorFor(code: string): VoiceError | null {
	switch (code) {
		case 'aborted':
			return null; // we stopped it ourselves
		case 'not-allowed':
		case 'service-not-allowed':
			return 'denied';
		case 'audio-capture':
			return 'noMic';
		case 'no-speech':
			return 'noSpeech';
		default:
			return 'failed';
	}
}
