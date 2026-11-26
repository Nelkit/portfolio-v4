/** When a build may apply the database migrations (pure, unit tested). */
export type MigrateDecision = { run: boolean; reason: string };

/**
 * Only Vercel production builds migrate. Previews and local builds use the
 * same production database (.env / Vercel env), so migrating there would
 * change it before the code that needs it is merged.
 */
export function shouldMigrate(env: Record<string, string | undefined>): MigrateDecision {
	if (env.SKIP_DEPLOY_MIGRATIONS === '1') return { run: false, reason: 'SKIP_DEPLOY_MIGRATIONS=1' };
	if (!env.VERCEL) return { run: false, reason: 'local build; run `pnpm db:migrate` by hand' };
	if (env.VERCEL_ENV !== 'production') return { run: false, reason: `Vercel ${env.VERCEL_ENV ?? 'unknown'} build` };
	return { run: true, reason: 'Vercel production build' };
}
