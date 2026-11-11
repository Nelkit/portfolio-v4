import { describe, expect, it } from 'vitest';
import { parseProfileForm, toPublicProfile, type ProfileData } from './profile';

const validFields = {
	name: ' Nelkit Chavez ',
	role_en: 'AI/ML Engineer',
	role_es: 'Ingeniero de IA/ML',
	intro_en: 'I build things.',
	intro_es: 'Construyo cosas.',
	contact_available_en: 'Available 2026',
	contact_available_es: 'Disponible 2026',
	contact_headline_en: "Let's build <em>something</em>",
	contact_headline_es: 'Construyamos <em>algo</em>',
	contact_description_en: 'Open to roles.',
	contact_description_es: 'Abierto a ofertas.',
	links: JSON.stringify([
		{ type: 'github', label: 'GitHub', url: 'https://github.com/nelkit' },
		{ type: 'email', label: 'Email', url: 'hello@nelkit.dev' },
	]),
};

describe('parseProfileForm', () => {
	it('accepts a complete bilingual profile and trims values', () => {
		const result = parseProfileForm(validFields);
		expect(result.ok).toBe(true);
		if (!result.ok) return;
		expect(result.value.name).toBe('Nelkit Chavez');
		expect(result.value.translations.es.role).toBe('Ingeniero de IA/ML');
		expect(result.value.translations.en.contactHeadline).toBe("Let's build <em>something</em>");
	});

	it('normalizes a bare email address to a mailto: link', () => {
		const result = parseProfileForm(validFields);
		if (!result.ok) throw new Error('expected ok');
		expect(result.value.links[1]).toEqual({ type: 'email', label: 'Email', url: 'mailto:hello@nelkit.dev' });
	});

	it('keeps the order of links as submitted', () => {
		const result = parseProfileForm(validFields);
		if (!result.ok) throw new Error('expected ok');
		expect(result.value.links.map((l) => l.type)).toEqual(['github', 'email']);
	});

	it('reports every missing required field by name', () => {
		const result = parseProfileForm({ ...validFields, name: '', role_es: '  ' });
		expect(result.ok).toBe(false);
		if (result.ok) return;
		expect(Object.keys(result.errors).sort()).toEqual(['name', 'role_es']);
	});

	it('rejects a web link that is not http(s)', () => {
		const links = JSON.stringify([{ type: 'github', label: 'GitHub', url: 'javascript:alert(1)' }]);
		const result = parseProfileForm({ ...validFields, links });
		expect(result.ok).toBe(false);
		if (!result.ok) expect(result.errors.links).toBeDefined();
	});

	it('rejects an invalid email link', () => {
		const links = JSON.stringify([{ type: 'email', label: 'Email', url: 'not-an-email' }]);
		expect(parseProfileForm({ ...validFields, links }).ok).toBe(false);
	});

	it('rejects malformed links JSON and unknown link types', () => {
		expect(parseProfileForm({ ...validFields, links: '{oops' }).ok).toBe(false);
		const unknown = JSON.stringify([{ type: 'myspace', label: 'X', url: 'https://x.com' }]);
		expect(parseProfileForm({ ...validFields, links: unknown }).ok).toBe(false);
	});

	it('accepts an empty links list', () => {
		expect(parseProfileForm({ ...validFields, links: '[]' }).ok).toBe(true);
	});
});

describe('toPublicProfile', () => {
	const url = (key: string) => `https://cdn.test/${key}`;
	const translation = (cvKey: string | null) => ({
		role: 'r',
		intro: 'i',
		cvKey,
		contactAvailable: 'a',
		contactHeadline: 'h',
		contactDescription: 'd',
	});
	const data: ProfileData = {
		name: 'Nelkit',
		avatarKey: 'profile/avatar-1.webp',
		translations: { en: translation('profile/cv-en.pdf'), es: translation(null) },
		links: [
			{ type: 'github', label: 'GitHub', url: 'https://github.com/nelkit' },
			{ type: 'email', label: 'Email', url: 'mailto:hello@nelkit.dev' },
		],
	};

	it('returns null when nothing has been saved yet', () => {
		expect(toPublicProfile(null, 'en', url)).toBeNull();
	});

	it('resolves file keys to public URLs', () => {
		const profile = toPublicProfile(data, 'en', url);
		expect(profile?.avatarUrl).toBe('https://cdn.test/profile/avatar-1.webp');
		expect(profile?.cvUrl).toBe('https://cdn.test/profile/cv-en.pdf');
	});

	it('falls back to the other language CV when this language has none', () => {
		expect(toPublicProfile(data, 'es', url)?.cvUrl).toBe('https://cdn.test/profile/cv-en.pdf');
	});

	it('exposes the contact email from the email link', () => {
		expect(toPublicProfile(data, 'en', url)?.contact.email).toBe('mailto:hello@nelkit.dev');
	});

	it('returns null avatar/CV when no files exist', () => {
		const bare: ProfileData = { ...data, avatarKey: null, translations: { en: translation(null), es: translation(null) } };
		const profile = toPublicProfile(bare, 'en', url);
		expect(profile?.avatarUrl).toBeNull();
		expect(profile?.cvUrl).toBeNull();
	});
});
