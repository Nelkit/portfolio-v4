export type UploadKind = 'image' | 'pdf';

/**
 * Per-file limits. Uploads go through a Server Action (body limit 4 MB in
 * next.config.ts, Vercel's hard cap is 4.5 MB): avatar + 2 CVs must fit.
 */
export const MAX_BYTES: Record<UploadKind, number> = {
	image: 1 * 1024 * 1024,
	pdf: 1.25 * 1024 * 1024,
};

export type UploadCheck =
	| { ok: true; ext: string; contentType: string }
	| { ok: false; error: string };

const startsWith = (bytes: Uint8Array, signature: number[], offset = 0) =>
	signature.every((value, i) => bytes[offset + i] === value);
const ascii = (s: string) => [...s].map((c) => c.charCodeAt(0));

const SIGNATURES: Record<UploadKind, { ext: string; contentType: string; match: (b: Uint8Array) => boolean }[]> = {
	image: [
		{ ext: 'png', contentType: 'image/png', match: (b) => startsWith(b, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]) },
		{ ext: 'jpg', contentType: 'image/jpeg', match: (b) => startsWith(b, [0xff, 0xd8, 0xff]) },
		{ ext: 'webp', contentType: 'image/webp', match: (b) => startsWith(b, ascii('RIFF')) && startsWith(b, ascii('WEBP'), 8) },
	],
	pdf: [{ ext: 'pdf', contentType: 'application/pdf', match: (b) => startsWith(b, ascii('%PDF-')) }],
};

/**
 * Trusts the file CONTENT (magic bytes), never the browser-provided name or
 * MIME type: files are served publicly, so an HTML/SVG disguised as .png must
 * not get through.
 */
export function validateUpload(bytes: Uint8Array, kind: UploadKind): UploadCheck {
	if (bytes.length === 0) return { ok: false, error: 'The file is empty.' };
	if (bytes.length > MAX_BYTES[kind]) {
		const mb = (MAX_BYTES[kind] / 1024 / 1024).toFixed(2).replace(/\.?0+$/, '');
		return { ok: false, error: `The file is larger than ${mb} MB.` };
	}
	const match = SIGNATURES[kind].find((s) => s.match(bytes));
	if (!match) {
		return { ok: false, error: kind === 'image' ? 'Use a PNG, JPEG or WEBP image.' : 'Use a PDF file.' };
	}
	return { ok: true, ext: match.ext, contentType: match.contentType };
}
