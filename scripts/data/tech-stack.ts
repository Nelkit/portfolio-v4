/**
 * Replaces every tech-stack tab with the list in tech-stack-plan.ts. Uses the
 * database configured in .env / .env.local.
 *
 *   pnpm stack:import            → dry run (prints every change)
 *   pnpm stack:import --confirm  → applies them, in ONE transaction
 *
 * Deletes all tabs and creates the planned ones. Tools are shared with the
 * projects, so a tool leaving the tabs is deleted only if no project uses it:
 * project tags never change, except for spelling fixes that only differ in
 * case (e.g. "MapBox" → "Mapbox").
 *
 * Idempotent: running it again changes nothing. The public site caches the
 * tech stack and is not told about this script: the change shows after the
 * next deploy (or after saving any tab in /admin).
 * Run `pnpm backup` first: this deletes data.
 */
import { createRequire } from 'node:module';

// @next/env is CommonJS: load it the way Next does, before any app module reads process.env.
const { loadEnvConfig } = createRequire(import.meta.url)('@next/env') as typeof import('@next/env');
loadEnvConfig(process.cwd(), true, { info: () => {}, error: console.error });

const CONFIRM = process.argv.includes('--confirm');

async function main() {
	// Imported lazily so .env is loaded before the modules read process.env.
	const { eq } = await import('drizzle-orm');
	const schema = await import('@/app/lib/db/schema');
	const { getDb } = await import('@/app/lib/db/client');
	const { createTursoSkillCategoryRepository } = await import('@/app/lib/content/skills/turso-skill-category-repository');
	const { deleteOrphanSkills, resolveSkillIds } = await import('@/app/lib/content/skills/skill-catalog');
	const { planStackImport, STACK_PLAN } = await import('./tech-stack-plan');

	const db = getDb();
	const dbUrl = process.env.TURSO_DATABASE_URL ?? '(missing)';
	console.log(`Database: ${dbUrl.startsWith('file:') ? dbUrl : dbUrl.replace(/^(\w+:\/\/)([^/?]+).*/, '$1$2')}`);
	console.log(CONFIRM ? 'Mode: APPLY\n' : 'Mode: dry run (re-run with --confirm to apply)\n');

	const [current, catalog, projectRows] = await Promise.all([
		createTursoSkillCategoryRepository(db).listCategories(),
		db.select().from(schema.skills),
		db.select({ id: schema.projectSkills.skillId }).from(schema.projectSkills),
	]);
	const plan = planStackImport({ plan: STACK_PLAN, current, catalog, projectSkillIds: projectRows.map((r) => r.id) });

	if (plan.alreadyApplied) {
		console.log('= The tech stack already matches the plan. Nothing to do.');
		return;
	}

	const list = (items: string[]) => (items.length ? items.join(', ') : '(none)');
	console.log('Delete tabs');
	for (const c of plan.deleteCategories) console.log(`  - #${c.id} ${c.name}`);
	console.log('\nCreate tabs');
	for (const c of plan.createCategories) {
		console.log(`  + ${c.translations.en.name} / ${c.translations.es.name} (${c.skills.length}): ${c.skills.join(' · ')}`);
	}
	console.log(`\nNew tools: ${list(plan.newSkills)}`);
	console.log(`Spelling fixes (projects too): ${list(plan.renameSkills.map((r) => `${r.from} → ${r.to}`))}`);
	console.log(`Leave the tabs, kept for projects: ${list(plan.keptForProjects)}`);
	console.log(`Deleted (used nowhere): ${list(plan.droppedSkills)}`);

	if (!CONFIRM) {
		console.log('\nDry run: nothing written. Run `pnpm backup` first, then re-run with --confirm.');
		return;
	}

	await db.transaction(async (tx) => {
		for (const r of plan.renameSkills) await tx.update(schema.skills).set({ name: r.to }).where(eq(schema.skills.id, r.id));
		// Children first: does not rely on SQLite's foreign_keys pragma being on.
		await tx.delete(schema.skillCategorySkills);
		await tx.delete(schema.skillCategoryTranslations);
		await tx.delete(schema.skillCategories);
		for (const [position, category] of plan.createCategories.entries()) {
			const [{ id }] = await tx
				.insert(schema.skillCategories)
				.values({ position })
				.returning({ id: schema.skillCategories.id });
			for (const [locale, t] of Object.entries(category.translations)) {
				await tx.insert(schema.skillCategoryTranslations).values({ categoryId: id, locale, name: t.name });
			}
			for (const [skillPosition, skillId] of (await resolveSkillIds(tx, category.skills)).entries()) {
				await tx.insert(schema.skillCategorySkills).values({ categoryId: id, skillId, position: skillPosition });
			}
		}
		await deleteOrphanSkills(tx);
	});
	console.log('\nApplied. The site shows it after the next deploy (or after saving any tab in /admin).');
}

main()
	.then(() => process.exit(0))
	.catch((error) => {
		console.error(error);
		process.exit(1);
	});
