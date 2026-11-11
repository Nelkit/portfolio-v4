import { defineConfig } from 'drizzle-kit';

export default defineConfig({
	schema: './app/lib/db/schema.ts',
	out: './drizzle',
	dialect: 'turso',
	dbCredentials: {
		url: process.env.TURSO_DATABASE_URL ?? 'file:local.db',
		// An empty TURSO_AUTH_TOKEN= line in .env must not count as a token (local file DBs need none).
		authToken: process.env.TURSO_AUTH_TOKEN || undefined,
	},
});
