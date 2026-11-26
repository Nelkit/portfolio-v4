/**
 * Runs before `next build` (package.json → build). In a Vercel production
 * build it applies the pending migrations in ./drizzle, so the new code never
 * goes live without its schema. Elsewhere it does nothing (see shouldMigrate).
 *
 * If a migration fails, the build fails and Vercel keeps serving the previous
 * deployment. Migrations run before the new code is live, so they must keep
 * working with the code that is live now (add columns/tables; remove them in
 * a later release). Uses the same `__drizzle_migrations` table as
 * `pnpm db:migrate`, so both can be mixed.
 */
import { createRequire } from 'node:module';
import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import { migrate } from 'drizzle-orm/libsql/migrator';
import { shouldMigrate } from './deploy-migrations';

// @next/env is CommonJS: load it the way Next does, before anything reads process.env.
const { loadEnvConfig } = createRequire(import.meta.url)('@next/env') as typeof import('@next/env');
loadEnvConfig(process.cwd(), false, { info: () => {}, error: console.error });

async function main() {
	const decision = shouldMigrate(process.env);
	if (!decision.run) {
		console.log(`Migrations: skipped (${decision.reason}).`);
		return;
	}
	const url = process.env.TURSO_DATABASE_URL;
	if (!url) throw new Error('TURSO_DATABASE_URL is not set');
	// Host only: never print query strings or credentials.
	console.log(`Migrations: applying to ${url.startsWith('file:') ? url : new URL(url).host} (${decision.reason})…`);
	const client = createClient({ url, authToken: process.env.TURSO_AUTH_TOKEN || undefined });
	try {
		await migrate(drizzle(client), { migrationsFolder: './drizzle' });
	} finally {
		client.close();
	}
	console.log('Migrations: up to date.');
}

main().catch((error) => {
	console.error('Migrations: FAILED. The deploy stops here; the live site is unchanged.');
	console.error(error);
	process.exit(1);
});
