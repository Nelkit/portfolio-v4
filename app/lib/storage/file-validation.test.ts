import { describe, expect, it } from 'vitest';
import { MAX_BYTES, validateUpload } from './file-validation';

const bytes = (...values: number[]) => new Uint8Array(values);
const ascii = (text: string) => new TextEncoder().encode(text);
const pad = (head: Uint8Array, size = 64) => {
	const out = new Uint8Array(size);
	out.set(head);
	return out;
};

describe('validateUpload', () => {
	it('detects PNG, JPEG and WEBP images by their magic bytes', () => {
		expect(validateUpload(pad(bytes(0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a)), 'image')).toEqual({
			ok: true, ext: 'png', contentType: 'image/png',
		});
		expect(validateUpload(pad(bytes(0xff, 0xd8, 0xff, 0xe0)), 'image')).toMatchObject({ ok: true, ext: 'jpg' });
		const webp = pad(new Uint8Array([...ascii('RIFF'), 0, 0, 0, 0, ...ascii('WEBP')]));
		expect(validateUpload(webp, 'image')).toMatchObject({ ok: true, ext: 'webp', contentType: 'image/webp' });
	});

	it('detects a PDF', () => {
		expect(validateUpload(pad(ascii('%PDF-1.7')), 'pdf')).toEqual({
			ok: true, ext: 'pdf', contentType: 'application/pdf',
		});
	});

	it('rejects a file whose content does not match the expected kind', () => {
		expect(validateUpload(pad(ascii('%PDF-1.7')), 'image').ok).toBe(false);
		expect(validateUpload(pad(bytes(0x89, 0x50, 0x4e, 0x47)), 'pdf').ok).toBe(false);
		// An SVG/HTML renamed to .png must not pass (could carry scripts).
		expect(validateUpload(pad(ascii('<svg onload=alert(1)>')), 'image').ok).toBe(false);
	});

	it('rejects empty files and files over the size limit', () => {
		expect(validateUpload(new Uint8Array(0), 'pdf').ok).toBe(false);
		const tooBig = pad(ascii('%PDF-1.7'), MAX_BYTES.pdf + 1);
		expect(validateUpload(tooBig, 'pdf').ok).toBe(false);
		const atLimit = pad(ascii('%PDF-1.7'), MAX_BYTES.pdf);
		expect(validateUpload(atLimit, 'pdf').ok).toBe(true);
	});
});
