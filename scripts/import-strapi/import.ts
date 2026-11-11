/**
 * Step 3 of the Strapi import. Uses the database and storage configured in .env.
 *   pnpm tsx scripts/import-strapi/import.ts            → dry run (prints the plan)
 *   pnpm tsx scripts/import-strapi/import.ts --confirm  → WIPES the content tables and imports
 * Needs data/strapi.json, data/content-en.json, data/content-es.json, and
 * Strapi running (media files are downloaded from it).
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { createRequire } from 'node:module';

// @next/env is CommonJS: load it the way Next does, before any app module reads process.env.
const { loadEnvConfig } = createRequire(import.meta.url)('@next/env') as typeof import('@next/env');
loadEnvConfig(process.cwd(), true, { info: () => {}, error: console.error });

const STRAPI = process.env.STRAPI_URL ?? 'http://localhost:1337';
const DATA = join(import.meta.dirname, 'data');
const CONFIRM = process.argv.includes('--confirm');
/** Generous limit for imported media (the admin limits apply to new uploads). */
const IMPORT_MAX_BYTES = 25 * 1024 * 1024;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Any = any;
const read = (file: string) => JSON.parse(readFileSync(join(DATA, file), 'utf8'));

async function main() {
	// Imported lazily so .env is loaded before the modules read process.env.
	const schema = await import('@/app/lib/db/schema');
	const { getDb } = await import('@/app/lib/db/client');
	const { getStorage, buildKey } = await import('@/app/lib/storage/storage');
	const { validateUpload } = await import('@/app/lib/storage/file-validation');
	const { parseLinks, LINK_TYPES } = await import('@/app/lib/content/links');
	const { slugify } = await import('@/app/lib/content/projects/project');
	const { createTursoHeroRepository } = await import('@/app/lib/content/hero/turso-hero-repository');
	const { createTursoProfileRepository } = await import('@/app/lib/content/profile/turso-profile-repository');
	const { createTursoAreaRepository } = await import('@/app/lib/content/areas/turso-area-repository');
	const { createTursoSkillCategoryRepository } = await import('@/app/lib/content/skills/turso-skill-category-repository');
	const { createTursoProjectRepository } = await import('@/app/lib/content/projects/turso-project-repository');
	const { createTursoCareerRepository } = await import('@/app/lib/content/career/turso-career-repository');
	const { createTursoEducationRepository } = await import('@/app/lib/content/education/turso-education-repository');
	const { createTursoTagRepository } = await import('@/app/lib/content/tags/turso-tag-repository');
	const { createTursoPostRepository } = await import('@/app/lib/content/posts/turso-post-repository');
	const { blocksToMarkdown, collectImageUrls } = await import('./blocks-to-markdown');
	const { parsePeriod } = await import('./periods');

	const raw: Any = read('strapi.json');
	const en: Any = read('content-en.json');
	const es: Any = read('content-es.json');

	// ---- Plan (always printed) ----
	const dbUrl = process.env.TURSO_DATABASE_URL ?? '(missing)';
	const dbTarget = dbUrl.startsWith('file:') ? dbUrl : dbUrl.replace(/^(\w+:\/\/)([^/?]+).*/, '$1$2');
	const storageTarget = process.env.R2_BUCKET ? `R2 bucket "${process.env.R2_BUCKET}" → ${process.env.R2_PUBLIC_URL}` : 'local disk (public/uploads)';
	console.log(`Database : ${dbTarget}`);
	console.log(`Storage  : ${storageTarget}`);
	console.log(`Strapi   : ${STRAPI}`);
	console.log(
		`Content  : profile + hero, ${raw.expertiseAreas.length} areas, ${raw.skillCategories.length} stack categories, ` +
			`${raw.projects.length} projects, ${raw.careerEntries.length} career, ${raw.educationEntries.length} education, ` +
			`${raw.blogTags.length} tags, ${raw.blogEntries.length} posts`,
	);
	if (!CONFIRM) {
		console.log('\nDry run. Re-run with --confirm to WIPE the content tables of that database and import.');
		return;
	}

	const db = getDb();
	const storage = getStorage();
	const warnings: string[] = [];

	// ---- 1. Wipe (children first: works whether or not SQLite enforces foreign keys) ----
	const wipeOrder = [
		schema.postTags, schema.postImages, schema.postTranslations, schema.posts,
		schema.tagTranslations, schema.tags,
		schema.educationEntryTranslations, schema.educationEntries,
		schema.careerEntryTranslations, schema.careerEntries,
		schema.projectSkills, schema.projectScreenshots, schema.projectLinks, schema.projectTranslations, schema.projects,
		schema.skillCategorySkills, schema.skillCategoryTranslations, schema.skillCategories, schema.skills,
		schema.expertiseAreaTranslations, schema.expertiseAreas,
		schema.socialLinks, schema.profileTranslations, schema.profile,
		schema.heroTranslations,
	];
	for (const table of wipeOrder) await db.delete(table);
	console.log('✓ wiped content tables');

	// ---- Media helper: download from Strapi → validate by content → storage ----
	async function upload(url: string | undefined, kind: 'image' | 'pdf', prefix: string): Promise<string | null> {
		if (!url) return null;
		const res = await fetch(url.startsWith('http') ? url : `${STRAPI}${url}`);
		if (!res.ok) {
			warnings.push(`download failed (${res.status}): ${url}`);
			return null;
		}
		const bytes = new Uint8Array(await res.arrayBuffer());
		const check = validateUpload(bytes, kind, IMPORT_MAX_BYTES);
		if (!check.ok) {
			warnings.push(`skipped ${url}: ${check.error}`);
			return null;
		}
		const key = buildKey(prefix, check.ext);
		await storage.put(key, bytes, check.contentType);
		return key;
	}

	const linkType = (type: string | undefined): string =>
		type && (LINK_TYPES as readonly string[]).includes(type) ? type : 'link';
	const withProtocol = (href: string, type: string) =>
		type === 'email' || /^(https?:|mailto:)/i.test(href) ? href : `https://${href}`;
	function links(list: Any[] | undefined, context: string) {
		const mapped = (list ?? []).map((l: Any) => {
			const type = linkType(l.type);
			return { type, label: l.label || type, url: withProtocol(l.href ?? l.url ?? '', type) };
		});
		const parsed = parseLinks(JSON.stringify(mapped));
		if (parsed.ok) return parsed.links;
		warnings.push(`${context}: links skipped (${parsed.error})`);
		return [];
	}

	// ---- 2. Hero + profile ----
	await createTursoHeroRepository(db).saveHeadlines({ en: en.hero.headline, es: es.hero.headline });
	const home = raw.homePage;
	const avatarKey = await upload(home.avatarImage?.url, 'image', 'profile/avatar');
	const cvKey = await upload(home.resume?.url, 'pdf', 'profile/cv-en');
	await createTursoProfileRepository(db).saveProfile({
		name: home.title ?? 'Nelkit Chavez',
		avatarKey,
		translations: { en: { ...en.profile, cvKey }, es: { ...es.profile, cvKey: null } },
		links: links(home.socialNetworkLinks, 'profile'),
	});
	console.log('✓ hero and profile (CV in English; the Spanish site falls back to it)');

	// ---- 3. Areas ----
	const areaRepo = createTursoAreaRepository(db);
	const areaIds = new Map<string, number>();
	for (const area of raw.expertiseAreas) {
		areaIds.set(area.code, await areaRepo.createArea({ translations: { en: { name: en.areas[area.code] }, es: { name: es.areas[area.code] } } }));
	}
	console.log(`✓ ${areaIds.size} areas`);

	// ---- 4. Tech stack ----
	const stackRepo = createTursoSkillCategoryRepository(db);
	for (const category of raw.skillCategories) {
		await stackRepo.createCategory({
			translations: { en: { name: en.skillCategories[category.label] }, es: { name: es.skillCategories[category.label] } },
			skills: (category.skills ?? []).map((s: Any) => s.title),
		});
	}
	console.log(`✓ ${raw.skillCategories.length} stack categories`);

	// ---- 5. Projects (created oldest first: new projects go on top, so the final order matches Strapi) ----
	const projectRepo = createTursoProjectRepository(db);
	for (const project of [...raw.projects].reverse()) {
		const slug = slugify(project.title);
		const id = await projectRepo.createProject({
			slug,
			company: project.company ?? '',
			areaId: areaIds.get(project.expertiseArea?.code) ?? null,
			skills: (project.skills ?? []).map((s: Any) => s.title),
			links: links(project.links, `project ${slug}`),
			translations: { en: en.projects[slug], es: es.projects[slug] },
		});
		const cover = await upload(project.image?.url, 'image', `projects/${id}/cover`);
		if (cover) await projectRepo.setProjectImage(id, cover);
		const shots = Array.isArray(project.screenshots) ? project.screenshots : project.screenshots ? [project.screenshots] : [];
		for (const shot of shots) {
			const key = await upload(shot.url, 'image', `projects/${id}/shot`);
			if (key) await projectRepo.addScreenshot(id, key);
		}
	}
	console.log(`✓ ${raw.projects.length} projects`);

	// ---- 6. Career + education ----
	const careerRepo = createTursoCareerRepository(db);
	for (const entry of raw.careerEntries) {
		const { start, end } = parsePeriod(entry.period);
		await careerRepo.createEntry({ start, end, translations: { en: en.career[entry.id], es: es.career[entry.id] } });
	}
	const educationRepo = createTursoEducationRepository(db);
	for (const entry of raw.educationEntries) {
		const { start, end } = parsePeriod(entry.period);
		await educationRepo.createEntry({
			start,
			end,
			inProgress: entry.completionStatus === 'In Progress' || end === null,
			translations: { en: en.education[entry.id], es: es.education[entry.id] },
		});
	}
	console.log(`✓ ${raw.careerEntries.length} career and ${raw.educationEntries.length} education entries`);

	// ---- 7. Tags + posts (posts only exist in English in Strapi) ----
	const tagRepo = createTursoTagRepository(db);
	const tagIds = new Map<string, number>();
	for (const tag of raw.blogTags) {
		tagIds.set(tag.title, await tagRepo.createTag({ slug: slugify(tag.title), translations: { en: { name: en.tags[tag.title] }, es: { name: es.tags[tag.title] } } }));
	}
	const postRepo = createTursoPostRepository(db);
	for (const entry of raw.blogEntries) {
		const base = {
			slug: entry.slug || slugify(entry.title),
			publishedOn: String(entry.publishedDate ?? entry.publishedAt ?? '').slice(0, 10),
			status: 'published' as const,
			tagIds: (entry.blog_tags ?? []).map((t: Any) => tagIds.get(t.title)).filter((id: number | undefined): id is number => id !== undefined),
		};
		const translation = (body: string) => ({ en: { title: entry.title, summary: entry.summary ?? '', body } });
		const id = await postRepo.createPost({ ...base, translations: translation(blocksToMarkdown(entry.body)) });
		const cover = await upload(entry.featuredImage?.url, 'image', `posts/${id}/cover`);
		if (cover) await postRepo.setPostCover(id, cover);
		// Body images → storage → upload:<key> references (storage-independent).
		const imageKeys = new Map<string, string>();
		for (const url of collectImageUrls(entry.body)) {
			const key = await upload(url, 'image', `posts/${id}/img`);
			if (key) {
				await postRepo.addPostImage(id, key);
				imageKeys.set(url, key);
			}
		}
		if (imageKeys.size > 0) {
			const body = blocksToMarkdown(entry.body, (url) => (imageKeys.has(url) ? `upload:${imageKeys.get(url)}` : url));
			await postRepo.updatePost(id, { ...base, translations: translation(body) });
		}
	}
	console.log(`✓ ${tagIds.size} tags and ${raw.blogEntries.length} posts`);

	console.log(warnings.length ? `\n⚠️  ${warnings.length} warning(s):\n- ${warnings.join('\n- ')}` : '\nDone, no warnings.');
}

main().catch((error) => {
	console.error(error);
	process.exit(1);
});
