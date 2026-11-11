import { describe, expect, it } from 'vitest';
import { getDictionary } from './index';
import { LOCALES } from '../locales';

type Node = Record<string, unknown>;

/** Flattens a dictionary into "path → kind" so both locales can be compared. */
function shape(node: Node, prefix = ''): Record<string, string> {
	return Object.entries(node).reduce<Record<string, string>>((acc, [key, value]) => {
		const path = prefix ? `${prefix}.${key}` : key;
		if (value && typeof value === 'object') return { ...acc, ...shape(value as Node, path) };
		acc[path] = typeof value === 'function' ? `fn/${(value as () => unknown).length}` : typeof value;
		return acc;
	}, {});
}

function emptyStrings(node: Node, prefix = ''): string[] {
	return Object.entries(node).flatMap(([key, value]) => {
		const path = prefix ? `${prefix}.${key}` : key;
		if (value && typeof value === 'object') return emptyStrings(value as Node, path);
		return typeof value === 'string' && value.trim() === '' ? [path] : [];
	});
}

describe('dictionaries', () => {
	it('every locale has exactly the same keys (and function arities) as English', () => {
		const reference = shape(getDictionary('en'));
		for (const locale of LOCALES) {
			expect(shape(getDictionary(locale)), `locale ${locale}`).toEqual(reference);
		}
	});

	it('has no empty translations', () => {
		for (const locale of LOCALES) {
			expect(emptyStrings(getDictionary(locale)), `locale ${locale}`).toEqual([]);
		}
	});

	it('pluralizes count-based labels', () => {
		const en = getDictionary('en');
		const es = getDictionary('es');
		expect(en.home.navSub.work(1)).toBe('1 project · shipped');
		expect(en.home.navSub.work(3)).toBe('3 projects · shipped');
		expect(es.home.navSub.work(1)).toBe('1 proyecto · publicado');
		expect(es.home.navSub.work(3)).toBe('3 proyectos · publicados');
	});
});
