import { describe, expect, it } from 'vitest';
import { createInAppHistory } from './in-app-history';

describe('createInAppHistory', () => {
	it('has nothing to go back to on the first page of a visit (direct entry, e.g. from Google)', () => {
		const history = createInAppHistory();
		history.visit('/en/projects/horus');
		expect(history.canGoBack()).toBe(false);
	});

	it('can go back after moving between pages of the site', () => {
		const history = createInAppHistory();
		history.visit('/en/projects');
		history.visit('/en/projects/horus');
		expect(history.canGoBack()).toBe(true);
	});

	it('ignores a repeated visit to the same path (re-renders, hash changes)', () => {
		const history = createInAppHistory();
		history.visit('/en/projects/horus');
		history.visit('/en/projects/horus');
		expect(history.canGoBack()).toBe(false);
	});

	it('does not count a language switch as moving to another page', () => {
		const history = createInAppHistory();
		history.visit('/en/projects/horus');
		history.visit('/es/projects/horus');
		expect(history.canGoBack()).toBe(false);
	});
});
