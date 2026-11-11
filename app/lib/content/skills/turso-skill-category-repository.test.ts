import { beforeEach, describe, expect, it } from 'vitest';
import { createClient } from '@libsql/client';
import { drizzle, type LibSQLDatabase } from 'drizzle-orm/libsql';
import { migrate } from 'drizzle-orm/libsql/migrator';
import { skills as skillsTable } from '@/app/lib/db/schema';
import { createTursoSkillCategoryRepository } from './turso-skill-category-repository';
import type { SkillCategoryRepository } from './skill-category-repository';
import type { CategoryInput } from './skill-category';

const category = (en: string, skills: string[]): CategoryInput => ({
	translations: { en: { name: en }, es: { name: `${en}-es` } },
	skills,
});

describe('TursoSkillCategoryRepository', () => {
	let db: LibSQLDatabase;
	let repo: SkillCategoryRepository;
	const catalog = async () => (await db.select().from(skillsTable)).map((s) => s.name).sort();

	beforeEach(async () => {
		db = drizzle(createClient({ url: ':memory:' }));
		await migrate(db, { migrationsFolder: './drizzle' });
		repo = createTursoSkillCategoryRepository(db);
	});

	it('creates categories at the end with their ordered skills', async () => {
		const mobile = await repo.createCategory(category('Mobile', ['Swift', 'Kotlin']));
		const ml = await repo.createCategory(category('ML', ['Python']));
		const list = await repo.listCategories();
		expect(list.map((c) => c.id)).toEqual([mobile, ml]);
		expect(list[0].skills.map((s) => s.name)).toEqual(['Swift', 'Kotlin']);
		expect(list[0].translations).toEqual({ en: { name: 'Mobile' }, es: { name: 'Mobile-es' } });
	});

	it('reuses an existing skill regardless of case (one catalog entry, first spelling kept)', async () => {
		const ml = await repo.createCategory(category('ML', ['Python']));
		const backend = await repo.createCategory(category('Backend', ['python', 'Go']));
		const [a, b] = [await repo.getCategory(ml), await repo.getCategory(backend)];
		expect(a?.skills[0].id).toBe(b?.skills[0].id);
		expect(b?.skills.map((s) => s.name)).toEqual(['Python', 'Go']);
		expect(await catalog()).toEqual(['Go', 'Python']);
	});

	it('replaces names, skills and their order on update', async () => {
		const id = await repo.createCategory(category('Mobile', ['Swift', 'Kotlin']));
		await repo.updateCategory(id, category('Apps', ['Kotlin', 'Flutter']));
		const record = await repo.getCategory(id);
		expect(record?.translations.en?.name).toBe('Apps');
		expect(record?.skills.map((s) => s.name)).toEqual(['Kotlin', 'Flutter']);
	});

	it('removes skills that are no longer in any category, keeps shared ones', async () => {
		const ml = await repo.createCategory(category('ML', ['Python', 'PyTorch']));
		await repo.createCategory(category('Backend', ['Python']));
		await repo.updateCategory(ml, category('ML', ['TensorFlow']));
		expect(await catalog()).toEqual(['Python', 'TensorFlow']);
	});

	it('deletes a category and its orphan skills', async () => {
		const ml = await repo.createCategory(category('ML', ['Python', 'PyTorch']));
		const backend = await repo.createCategory(category('Backend', ['Python']));
		await repo.deleteCategory(ml);
		expect(await repo.getCategory(ml)).toBeNull();
		expect((await repo.listCategories()).map((c) => c.id)).toEqual([backend]);
		expect(await catalog()).toEqual(['Python']);
	});

	it('reorders categories', async () => {
		const a = await repo.createCategory(category('A', []));
		const b = await repo.createCategory(category('B', []));
		const c = await repo.createCategory(category('C', []));
		await repo.reorderCategories([b, c, a]);
		expect((await repo.listCategories()).map((x) => x.id)).toEqual([b, c, a]);
	});
});
