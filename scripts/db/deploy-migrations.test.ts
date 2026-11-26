import { describe, expect, it } from 'vitest';
import { shouldMigrate } from './deploy-migrations';

describe('shouldMigrate', () => {
	it('migrates in a Vercel production build', () => {
		expect(shouldMigrate({ VERCEL: '1', VERCEL_ENV: 'production' }).run).toBe(true);
	});

	it('skips preview builds: they share the production database and must not change it before a merge', () => {
		const decision = shouldMigrate({ VERCEL: '1', VERCEL_ENV: 'preview' });
		expect(decision.run).toBe(false);
		expect(decision.reason).toMatch(/preview/);
	});

	it('skips local builds, even if .env points to production', () => {
		expect(shouldMigrate({}).run).toBe(false);
		expect(shouldMigrate({ VERCEL_ENV: 'production' }).run).toBe(false);
	});

	it('can be turned off in production with SKIP_DEPLOY_MIGRATIONS=1', () => {
		expect(shouldMigrate({ VERCEL: '1', VERCEL_ENV: 'production', SKIP_DEPLOY_MIGRATIONS: '1' }).run).toBe(false);
	});
});
