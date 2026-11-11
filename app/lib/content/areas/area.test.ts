import { describe, expect, it } from 'vitest';
import { parseAreaForm, toAreaView } from './area';

describe('parseAreaForm', () => {
	it('accepts a name in every language, trimmed', () => {
		expect(parseAreaForm({ name_en: ' Machine Learning ', name_es: ' Aprendizaje automático ' })).toEqual({
			ok: true,
			value: { translations: { en: { name: 'Machine Learning' }, es: { name: 'Aprendizaje automático' } } },
		});
	});

	it('requires the name in every language', () => {
		const result = parseAreaForm({ name_en: 'Mobile', name_es: ' ' });
		expect(result.ok).toBe(false);
		if (!result.ok) expect(Object.keys(result.errors)).toEqual(['name_es']);
	});

	it('limits the name length', () => {
		expect(parseAreaForm({ name_en: 'x'.repeat(41), name_es: 'ok' }).ok).toBe(false);
	});
});

describe('toAreaView', () => {
	it('picks the requested language and falls back to the other one', () => {
		const record = { id: 3, translations: { en: { name: 'Mobile' }, es: { name: 'Móvil' } } };
		expect(toAreaView(record, 'es')).toEqual({ id: 3, name: 'Móvil' });
		expect(toAreaView({ id: 3, translations: { en: { name: 'Mobile' } } }, 'es')).toEqual({ id: 3, name: 'Mobile' });
		expect(toAreaView({ id: 3, translations: {} }, 'es')).toBeNull();
	});
});
