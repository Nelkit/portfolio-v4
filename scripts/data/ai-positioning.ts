/**
 * One-off data update for the "AI Product Engineer" repositioning. Uses the
 * database configured in .env / .env.local.
 *
 *   pnpm tsx scripts/data/ai-positioning.ts            → dry run (prints every change)
 *   pnpm tsx scripts/data/ai-positioning.ts --confirm  → applies them
 *
 * Idempotent: running it again changes nothing. Release order:
 *   1. pnpm db:migrate   2. this script with --confirm   3. deploy
 * (The running deployment keeps serving its cached pages; the new deployment
 * starts with a fresh cache and reads the updated data.)
 *
 * Stops without writing if the database has a project or link label the plan
 * does not know, so nothing is guessed.
 */
import { createRequire } from 'node:module';

// @next/env is CommonJS: load it the way Next does, before any app module reads process.env.
const { loadEnvConfig } = createRequire(import.meta.url)('@next/env') as typeof import('@next/env');
loadEnvConfig(process.cwd(), true, { info: () => {}, error: console.error });

const CONFIRM = process.argv.includes('--confirm');

/** "Available 2026" badge → "Available now" (only if still the old text). */
const AVAILABLE = {
	en: { from: 'Available 2026', to: 'Available now' },
	es: { from: 'Disponible 2026', to: 'Disponible ahora' },
} as const;

async function main() {
	// Imported lazily so .env is loaded before the modules read process.env.
	const { asc, eq } = await import('drizzle-orm');
	const schema = await import('@/app/lib/db/schema');
	const { getDb } = await import('@/app/lib/db/client');
	const { LOCALES } = await import('@/app/lib/i18n/locales');
	const { createTursoAreaRepository } = await import('@/app/lib/content/areas/turso-area-repository');
	const { createTursoProjectRepository } = await import('@/app/lib/content/projects/turso-project-repository');
	const { createTursoSkillCategoryRepository } = await import('@/app/lib/content/skills/turso-skill-category-repository');
	const { AREA_PLAN, PROJECT_PLAN, linkLabelFor, normaliseSkills, splitSections } = await import('./ai-positioning-plan');
	type ProjectInput = import('@/app/lib/content/projects/project').ProjectInput;
	type LinkType = import('@/app/lib/content/links').LinkType;
	type AreaKey = import('./ai-positioning-plan').AreaKey;

	const db = getDb();
	const areas = createTursoAreaRepository(db);
	const projects = createTursoProjectRepository(db);
	const stack = createTursoSkillCategoryRepository(db);

	const dbUrl = process.env.TURSO_DATABASE_URL ?? '(missing)';
	console.log(`Database: ${dbUrl.startsWith('file:') ? dbUrl : dbUrl.replace(/^(\w+:\/\/)([^/?]+).*/, '$1$2')}`);
	console.log(CONFIRM ? 'Mode: APPLY\n' : 'Mode: dry run (re-run with --confirm to apply)\n');

	const problems: string[] = [];
	const log = (line: string) => console.log(line);

	// ---------- 1. Categories ----------
	log('Categories');
	const existingAreas = await areas.listAreas();
	const areaIdByKey = new Map<AreaKey, number>();
	const areaWrites: (() => Promise<void>)[] = [];
	for (const plan of AREA_PLAN) {
		const translations = { en: { name: plan.en }, es: { name: plan.es } };
		const match = existingAreas.find((a) => [plan.en, ...plan.from].includes(a.translations.en?.name ?? ''));
		if (!match) {
			log(`  + create "${plan.en}" / "${plan.es}"`);
			areaWrites.push(async () => {
				areaIdByKey.set(plan.key, await areas.createArea({ translations }));
			});
			continue;
		}
		areaIdByKey.set(plan.key, match.id);
		const current = `${match.translations.en?.name} / ${match.translations.es?.name}`;
		if (current !== `${plan.en} / ${plan.es}`) {
			log(`  ~ rename #${match.id} "${current}" → "${plan.en} / ${plan.es}"`);
			areaWrites.push(() => areas.updateArea(match.id, { translations }));
		} else {
			log(`  = #${match.id} ${plan.en}`);
		}
	}
	const unplanned = existingAreas.filter((a) => ![...areaIdByKey.values()].includes(a.id));
	for (const a of unplanned) log(`  ! #${a.id} "${a.translations.en?.name}" is not in the plan: kept, listed last`);

	// ---------- 2. Projects ----------
	log('\nProjects');
	const records = await projects.listProjects();
	const linkRows = await db.select().from(schema.projectLinks).orderBy(asc(schema.projectLinks.position));
	for (const slug of Object.keys(PROJECT_PLAN)) {
		if (!records.some((r) => r.slug === slug)) problems.push(`project "${slug}" from the plan is not in the database`);
	}

	const projectWrites: { id: number; slug: string; build: () => ProjectInput }[] = [];
	for (const record of records) {
		const plan = PROJECT_PLAN[record.slug];
		if (!plan) {
			problems.push(`project "${record.slug}" is not in the plan`);
			continue;
		}

		// Links: read the stored labels (the repository already hides non-standard ones).
		const rawLinks = linkRows.filter((l) => l.projectId === record.id);
		const links = rawLinks.map((l) => {
			const label = linkLabelFor(l.label);
			if (!label) problems.push(`${record.slug}: unknown link label "${l.label}"`);
			return { type: l.type as LinkType, label: label ?? 'website', url: l.url };
		});

		// Only the languages the project has (a missing one stays missing).
		const translations = Object.fromEntries(
			LOCALES.flatMap((locale) => {
				const t = record.translations[locale];
				if (!t) return [];
				const split = plan.splitSections ? splitSections(t.description, locale) : null;
				if (plan.splitSections && !split && /^## /m.test(t.description)) {
					problems.push(`${record.slug} (${locale}): description has H2s the plan does not know`);
				}
				return [[locale, split ? { ...t, ...split } : t]];
			}),
		) as ProjectInput['translations'];

		const featured = plan.featuredOrder !== undefined;
		const next = {
			organisation: plan.organisation,
			year: plan.year,
			featured,
			featuredOrder: plan.featuredOrder ?? 0,
			screenshotsPosition: record.screenshotsPosition,
			skills: normaliseSkills(record.skills, plan.addSkills, plan.removeSkills),
			links,
		};

		const changes: string[] = [];
		if (record.organisation !== next.organisation || record.year !== next.year) {
			changes.push(`year ${record.year ?? '(none)'} → ${next.year}, organisation "${record.organisation}" → "${next.organisation}"`);
		}
		const currentArea = existingAreas.find((a) => a.id === record.areaId)?.translations.en?.name ?? `#${record.areaId}`;
		const plannedArea = AREA_PLAN.find((a) => a.key === plan.area)!;
		if (areaIdByKey.get(plan.area) !== record.areaId) changes.push(`category ${currentArea} → ${plannedArea.en}`);
		if (record.featured !== featured || record.featuredOrder !== next.featuredOrder) {
			changes.push(featured ? `featured #${next.featuredOrder}` : 'not featured');
		}
		if (JSON.stringify(record.skills) !== JSON.stringify(next.skills)) {
			changes.push(`tags [${record.skills.join(', ')}] → [${next.skills.join(', ')}]`);
		}
		const oldLabels = rawLinks.map((l) => l.label).join(', ');
		const newLabels = links.map((l) => l.label).join(', ');
		if (oldLabels !== newLabels) changes.push(`links [${oldLabels}] → [${newLabels}]`);
		for (const locale of LOCALES) {
			const before = record.translations[locale];
			const after = translations[locale];
			if (before && after && before.description !== after.description) {
				changes.push(`${locale}: description split into Overview / How it works / Results / My role (role "${after.role}")`);
			}
		}

		log(changes.length ? `  ~ ${record.slug}\n      ${changes.join('\n      ')}` : `  = ${record.slug}`);
		if (changes.length) {
			projectWrites.push({
				id: record.id,
				slug: record.slug,
				// Area ids of new categories exist only after step 1 runs.
				build: () => ({ slug: record.slug, areaId: areaIdByKey.get(plan.area)!, translations, ...next }),
			});
		}
	}

	// ---------- 3. Tech-stack categories (same tag names everywhere) ----------
	log('\nTech-stack categories');
	const categoryWrites: (() => Promise<void>)[] = [];
	for (const category of await stack.listCategories()) {
		const names = category.skills.map((s) => s.name);
		const normalised = normaliseSkills(names);
		if (JSON.stringify(names) === JSON.stringify(normalised)) continue;
		const en = category.translations.en?.name ?? `#${category.id}`;
		log(`  ~ ${en}: [${names.join(', ')}] → [${normalised.join(', ')}]`);
		categoryWrites.push(() =>
			stack.updateCategory(category.id, {
				translations: { en: category.translations.en ?? { name: en }, es: category.translations.es ?? { name: en } },
				skills: normalised,
			}),
		);
	}
	if (categoryWrites.length === 0) log('  = nothing to rename');

	// ---------- 4. "Available" badge ----------
	log('\nProfile badge');
	const profileRows = await db.select().from(schema.profileTranslations);
	const profileWrites: (() => Promise<unknown>)[] = [];
	for (const locale of LOCALES) {
		const row = profileRows.find((r) => r.locale === locale);
		const { from, to } = AVAILABLE[locale];
		if (!row) log(`  ! ${locale}: no profile row (the site shows the dictionary text "${to}")`);
		else if (row.contactAvailable === to) log(`  = ${locale}: "${to}"`);
		else if (row.contactAvailable !== from) log(`  ! ${locale}: "${row.contactAvailable}" is custom text: left as is`);
		else {
			log(`  ~ ${locale}: "${from}" → "${to}"`);
			profileWrites.push(() =>
				db.update(schema.profileTranslations).set({ contactAvailable: to }).where(eq(schema.profileTranslations.locale, locale)),
			);
		}
	}

	// ---------- Apply ----------
	if (problems.length) {
		console.error(`\nStopped, nothing written. Fix these first:\n  - ${problems.join('\n  - ')}`);
		process.exitCode = 1;
		return;
	}
	if (!CONFIRM) {
		log('\nDry run: nothing written.');
		return;
	}

	for (const write of areaWrites) await write();
	const order = [...AREA_PLAN.map((a) => areaIdByKey.get(a.key)!), ...unplanned.map((a) => a.id)];
	await areas.reorderAreas(order);
	for (const { id, build } of projectWrites) await projects.updateProject(id, build());
	for (const write of categoryWrites) await write();
	for (const write of profileWrites) await write();
	log(`\nDone: ${areaWrites.length} categories, ${projectWrites.length} projects, ${categoryWrites.length} stack categories, ${profileWrites.length} profile rows.`);
}

main().catch((error) => {
	console.error(error);
	process.exitCode = 1;
});
