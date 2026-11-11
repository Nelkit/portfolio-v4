import { describe, expect, it } from 'vitest';
import { parseTagForm, tagChips, toTagView } from './tag';

describe('parseTagForm', () => {
	it('accepts bilingual names and derives the slug from the English name', () => {
		expect(parseTagForm({ slug: '', name_en: ' Machine Learning ', name_es: 'Aprendizaje automático' })).toEqual({
			ok: true,
			value: { slug: 'machine-learning', translations: { en: { name: 'Machine Learning' }, es: { name: 'Aprendizaje automático' } } },
		});
	});

	it('keeps an explicit slug and validates it', () => {
		expect(parseTagForm({ slug: 'ml', name_en: 'ML', name_es: 'ML' }).ok && true).toBe(true);
		const bad = parseTagForm({ slug: 'Bad Slug', name_en: 'ML', name_es: 'ML' });
		expect(bad.ok).toBe(false);
		if (!bad.ok) expect(bad.errors.slug).toBeDefined();
	});

	it('requires the name in every language', () => {
		const result = parseTagForm({ slug: '', name_en: 'ML', name_es: '' });
		expect(result.ok).toBe(false);
		if (!result.ok) expect(Object.keys(result.errors)).toEqual(['name_es']);
	});
});

describe('toTagView', () => {
	it('picks the language, with fallback', () => {
		const record = { id: 1, slug: 'ml', translations: { en: { name: 'ML' }, es: { name: 'AA' } } };
		expect(toTagView(record, 'es')).toEqual({ id: 1, slug: 'ml', name: 'AA' });
		expect(toTagView({ ...record, translations: { en: { name: 'ML' } } }, 'es')?.name).toBe('ML');
	});
});

describe('tagChips', () => {
	it('lists only tags used by the given posts, with counts, sorted by name', () => {
		const tags = [
			{ id: 1, slug: 'web', name: 'Web' },
			{ id: 2, slug: 'ml', name: 'ML' },
			{ id: 3, slug: 'go', name: 'Go' },
		];
		const posts = [{ tags: [tags[0], tags[1]] }, { tags: [tags[1]] }];
		expect(tagChips(tags, posts)).toEqual([
			{ id: 2, slug: 'ml', name: 'ML', count: 2 },
			{ id: 1, slug: 'web', name: 'Web', count: 1 },
		]);
	});
});
