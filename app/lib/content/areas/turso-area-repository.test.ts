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

	const translation = (title: string) => ({ title, summary: 's', description: '', keyResult: '', role: '', howItWorks: '', results: '', myRole: '' });
	const project = (slug: string, areaId: number) => ({
		slug,
		organisation: '',
		year: null,
		areaId,
		featured: false,
		featuredOrder: 0,
		skills: [],
		translations: { en: translation(slug), es: translation(slug) },
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

	it('refuses to delete an area that still has projects (every project needs one)', async () => {
		const ml = await areas.createArea(area('ML'));
		const p1 = await projects.createProject(project('p1', ml));

		expect(await areas.deleteArea(ml)).toEqual({ deleted: false, projects: 1 });

		expect(await areas.getArea(ml)).not.toBeNull();
		expect((await projects.getProject(p1))?.areaId).toBe(ml);
	});

	it('deletes an area without projects', async () => {
		const empty = await areas.createArea(area('Empty'));
		expect(await areas.deleteArea(empty)).toEqual({ deleted: true, projects: 0 });
		expect(await areas.getArea(empty)).toBeNull();
	});
});
