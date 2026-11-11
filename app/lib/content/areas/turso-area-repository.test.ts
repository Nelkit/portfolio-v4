import { beforeEach, describe, expect, it } from 'vitest';
import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import { migrate } from 'drizzle-orm/libsql/migrator';
import { createTursoAreaRepository } from './turso-area-repository';
import { createTursoProjectRepository } from '../projects/turso-project-repository';
import type { AreaRepository } from './area-repository';
import type { ProjectRepository } from '../projects/project-repository';
import type { AreaInput } from './area';

const area = (en: string, es = `${en}-es`): AreaInput => ({ translations: { en: { name: en }, es: { name: es } } });

describe('TursoAreaRepository', () => {
	let areas: AreaRepository;
	let projects: ProjectRepository;

	beforeEach(async () => {
		const db = drizzle(createClient({ url: ':memory:' }));
		await migrate(db, { migrationsFolder: './drizzle' });
		areas = createTursoAreaRepository(db);
		projects = createTursoProjectRepository(db);
	});

	const project = (slug: string, areaId: number | null) => ({
		slug,
		company: '',
		areaId,
		translations: {
			en: { title: slug, summary: 's', description: '' },
			es: { title: slug, summary: 's', description: '' },
		},
		links: [],
	});

	it('creates areas at the end of the list and reads them back', async () => {
		const ml = await areas.createArea(area('ML'));
		const mobile = await areas.createArea(area('Mobile', 'Móvil'));
		expect(await areas.listAreas()).toEqual([
			{ id: ml, ...area('ML') },
			{ id: mobile, ...area('Mobile', 'Móvil') },
		]);
		expect(await areas.getArea(mobile)).toEqual({ id: mobile, ...area('Mobile', 'Móvil') });
		expect(await areas.getArea(999)).toBeNull();
	});

	it('renames an area', async () => {
		const id = await areas.createArea(area('ML'));
		await areas.updateArea(id, area('AI', 'IA'));
		expect(await areas.getArea(id)).toEqual({ id, ...area('AI', 'IA') });
	});

	it('reorders areas', async () => {
		const a = await areas.createArea(area('A'));
		const b = await areas.createArea(area('B'));
		const c = await areas.createArea(area('C'));
		await areas.reorderAreas([c, a, b]);
		expect((await areas.listAreas()).map((x) => x.id)).toEqual([c, a, b]);
	});

	it('deleting an area leaves its projects without area (they are not deleted)', async () => {
		const ml = await areas.createArea(area('ML'));
		const keep = await areas.createArea(area('Mobile'));
		const p1 = await projects.createProject(project('p1', ml));
		const p2 = await projects.createProject(project('p2', keep));

		await areas.deleteArea(ml);

		expect(await areas.getArea(ml)).toBeNull();
		expect((await projects.getProject(p1))?.areaId).toBeNull();
		expect((await projects.getProject(p2))?.areaId).toBe(keep);
	});
});
