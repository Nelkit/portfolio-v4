/**
 * Imports scripts/projects/data/projects-en.json + projects-es.json into the
 * database configured in .env / .env.local.
 *
 *   pnpm tsx scripts/projects/import-projects.ts            → dry run (prints every change)
 *   pnpm tsx scripts/projects/import-projects.ts --confirm  → applies them
 *
 * - Matches projects by slug. An existing project gets only the fields the JSON
 *   has; a missing slug is created (new projects go first in the list).
 * - Categories are matched by name; a missing one is created if NEW_CATEGORIES
 *   has its Spanish name.
 * - Images, screenshots, display order and projects that are not in the JSON
 *   are never touched.
 * - Every project goes through the admin form rules; if anything fails, the
 *   script stops before writing.
 * - Idempotent: running it again changes nothing.
 *
 * The running deployment keeps serving its cached pages: redeploy (or save any
 * project in the admin) to refresh them.
 */
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { join } from 'node:path';

// @next/env is CommonJS: load it the way Next does, before any app module reads process.env.
const { loadEnvConfig } = createRequire(import.meta.url)('@next/env') as typeof import('@next/env');
loadEnvConfig(process.cwd(), true, { info: () => {}, error: console.error });

const CONFIRM = process.argv.includes('--confirm');
const DATA_DIR = join(process.cwd(), 'scripts/projects/data');

/** Categories the import may create: English name → Spanish name. */
const NEW_CATEGORIES: Record<string, string> = {
	'Data Engineering': 'Ingeniería de datos',
};

/** Stands in for the id of a category that the dry run has not created yet. */
const PENDING_AREA_ID = 999_999;

async function main() {
	// Imported lazily so .env is loaded before the modules read process.env.
	const { getDb } = await import('@/app/lib/db/client');
	const schema = await import('@/app/lib/db/schema');
	const { createTursoAreaRepository } = await import('@/app/lib/content/areas/turso-area-repository');
	const { createTursoProjectRepository } = await import('@/app/lib/content/projects/turso-project-repository');
	const { buildProjectInput, findArea, pairEntries } = await import('./import-projects-plan');
	type ProjectEntry = import('./import-projects-plan').ProjectEntry;
	type ProjectInput = import('@/app/lib/content/projects/project').ProjectInput;
	type ProjectRecord = import('@/app/lib/content/projects/project').ProjectRecord;

	const read = (locale: string) =>
		JSON.parse(readFileSync(join(DATA_DIR, `projects-${locale}.json`), 'utf8')) as ProjectEntry[];

	const db = getDb();
	const areas = createTursoAreaRepository(db);
	const projects = createTursoProjectRepository(db);

	const dbUrl = process.env.TURSO_DATABASE_URL ?? '(missing)';
	console.log(`Database: ${dbUrl.startsWith('file:') ? dbUrl : dbUrl.replace(/^(\w+:\/\/)([^/?]+).*/, '$1$2')}`);
	console.log(CONFIRM ? 'Mode: APPLY\n' : 'Mode: dry run (re-run with --confirm to apply)\n');

	const log = (line: string) => console.log(line);
	const { pairs, problems } = pairEntries(read('en'), read('es'));

	// ---------- 1. Categories ----------
	log('Categories');
	const existingAreas = await areas.listAreas();
	const areaIdByName = new Map<string, number>();
	const newAreas = new Map<string, string>(); // English name → Spanish name
	for (const name of new Set(pairs.map((p) => p.en.category).filter((c): c is string => Boolean(c)))) {
		const match = findArea(existingAreas, name);
		if (match) {
			areaIdByName.set(name, match.id);
			log(`  = #${match.id} ${name}`);
		} else if (NEW_CATEGORIES[name]) {
			newAreas.set(name, NEW_CATEGORIES[name]);
			areaIdByName.set(name, PENDING_AREA_ID);
			log(`  + create "${name}" / "${NEW_CATEGORIES[name]}"`);
		} else {
			problems.push(`category "${name}" does not exist: add its Spanish name to NEW_CATEGORIES`);
		}
	}

	// ---------- 2. Projects ----------
	log('\nProjects');
	const records = await projects.listProjects();
	const catalog = new Map((await db.select().from(schema.skills)).map((s) => [s.name.toLowerCase(), s.name]));
	const spellings = new Set<string>();
	type Write = { pair: (typeof pairs)[number]; existing: ProjectRecord | null; input: ProjectInput };
	const writes: Write[] = [];
	for (const pair of pairs) {
		const existing = records.find((r) => r.slug === pair.slug) ?? null;
		const areaId = pair.en.category ? (areaIdByName.get(pair.en.category) ?? null) : (existing?.areaId ?? null);
		const result = buildProjectInput(existing, pair, areaId);
		if (!result.ok) {
			for (const [field, message] of Object.entries(result.errors)) problems.push(`${pair.slug}: ${field}: ${message}`);
			continue;
		}
		const input = result.value;
		for (const name of input.skills) {
			const stored = catalog.get(name.toLowerCase());
			if (stored && stored !== name) spellings.add(`"${name}" is stored as "${stored}"`);
		}
		if (!existing) {
			log(`  + create ${pair.slug}`);
			writes.push({ pair, existing, input });
			continue;
		}
		const changed = changedFields(existing, input);
		log(changed.length ? `  ~ ${pair.slug}: ${changed.join(', ')}` : `  = ${pair.slug}`);
		if (changed.length) writes.push({ pair, existing, input });
	}
	const untouched = records.filter((r) => !pairs.some((p) => p.slug === r.slug));
	for (const r of untouched) log(`  · ${r.slug} is not in the JSON: left as is`);
	if (spellings.size) {
		log('\nTags keep the spelling of the shared catalog (rename them in the admin if needed):');
		for (const line of spellings) log(`  · ${line}`);
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

	for (const [en, es] of newAreas) {
		const id = await areas.createArea({ translations: { en: { name: en }, es: { name: es } } });
		areaIdByName.set(en, id);
	}
	let created = 0;
	for (const { pair, existing, input } of writes) {
		const areaId = input.areaId === PENDING_AREA_ID ? areaIdByName.get(pair.en.category!)! : input.areaId;
		if (existing) await projects.updateProject(existing.id, { ...input, areaId });
		else {
			await projects.createProject({ ...input, areaId });
			created++;
		}
	}
	log(`\nDone: ${newAreas.size} categories created, ${created} projects created, ${writes.length - created} updated.`);
}

/** Names of the fields that differ between the stored project and the new input. */
function changedFields(
	existing: import('@/app/lib/content/projects/project').ProjectRecord,
	input: import('@/app/lib/content/projects/project').ProjectInput,
): string[] {
	const same = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);
	const changed: string[] = [];
	for (const key of ['organisation', 'year', 'areaId', 'featured', 'featuredOrder', 'links'] as const) {
		if (!same(existing[key], input[key])) changed.push(key === 'areaId' ? 'category' : key);
	}
	// The skill catalog matches names ignoring case and keeps its own spelling.
	const lower = (names: string[]) => names.map((n) => n.toLowerCase());
	if (!same(lower(existing.skills), lower(input.skills))) changed.push('skills');
	for (const [locale, translation] of Object.entries(input.translations)) {
		const before = existing.translations[locale as keyof typeof existing.translations];
		for (const [key, value] of Object.entries(translation)) {
			if (before?.[key as keyof typeof before] !== value) changed.push(`${locale}.${key === 'description' ? 'overview' : key}`);
		}
	}
	return changed;
}

main().catch((error) => {
	console.error(error);
	process.exitCode = 1;
});
