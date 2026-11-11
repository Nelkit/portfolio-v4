import { describe, expect, it } from 'vitest';
import { countUniqueSkills, parseCategoryForm, toCategoryView } from './skill-category';

const fields = (skills: unknown, en = 'Mobile', es = 'Móvil') => ({
	name_en: en,
	name_es: es,
	skills: typeof skills === 'string' ? skills : JSON.stringify(skills),
});

describe('parseCategoryForm', () => {
	it('accepts bilingual names and an ordered skill list, trimmed', () => {
		expect(parseCategoryForm(fields([' Swift ', 'Kotlin', 'React Native']))).toEqual({
			ok: true,
			value: {
				translations: { en: { name: 'Mobile' }, es: { name: 'Móvil' } },
				skills: ['Swift', 'Kotlin', 'React Native'],
			},
		});
	});

	it('drops empty entries and case-insensitive duplicates (keeps the first spelling)', () => {
		const result = parseCategoryForm(fields(['Python', '  ', 'python', 'PyTorch', 'PYTHON']));
		expect(result.ok && result.value.skills).toEqual(['Python', 'PyTorch']);
	});

	it('allows a category with no skills yet', () => {
		expect(parseCategoryForm(fields([])).ok).toBe(true);
	});

	it('requires the name in every language', () => {
		const result = parseCategoryForm(fields(['Swift'], 'Mobile', ''));
		expect(result.ok).toBe(false);
		if (!result.ok) expect(Object.keys(result.errors)).toEqual(['name_es']);
	});

	it('rejects malformed skills and names that are too long', () => {
		expect(parseCategoryForm(fields('{oops')).ok).toBe(false);
		expect(parseCategoryForm(fields([42])).ok).toBe(false);
		const tooLong = parseCategoryForm(fields(['x'.repeat(41)]));
		expect(tooLong.ok).toBe(false);
		if (!tooLong.ok) expect(tooLong.errors.skills).toBeDefined();
	});
});

describe('toCategoryView', () => {
	const record = {
		id: 4,
		translations: { en: { name: 'Mobile' }, es: { name: 'Móvil' } },
		skills: [{ id: 1, name: 'Swift' }, { id: 2, name: 'Kotlin' }],
	};

	it('picks the language (with fallback) and keeps the skill order', () => {
		expect(toCategoryView(record, 'es')).toEqual({ id: 4, name: 'Móvil', skills: ['Swift', 'Kotlin'] });
		expect(toCategoryView({ ...record, translations: { en: { name: 'Mobile' } } }, 'es')?.name).toBe('Mobile');
	});
});

describe('countUniqueSkills', () => {
	it('counts a skill shared by several categories once', () => {
		expect(countUniqueSkills([
			{ id: 1, name: 'ML', skills: ['Python', 'PyTorch'] },
			{ id: 2, name: 'Backend', skills: ['Python', 'Go'] },
		])).toBe(3);
		expect(countUniqueSkills([])).toBe(0);
	});
});
