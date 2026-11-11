import { beforeEach, describe, expect, it } from 'vitest';
import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import { migrate } from 'drizzle-orm/libsql/migrator';
import { createTursoProjectRepository } from './turso-project-repository';
import type { ProjectRepository } from './project-repository';
import type { ProjectInput } from './project';

const project = (slug: string, links: ProjectInput['links'] = []): ProjectInput => ({
	slug,
	company: 'Acme',
	translations: {
		en: { title: `${slug} en`, summary: 'sum en', description: 'desc en' },
		es: { title: `${slug} es`, summary: 'sum es', description: 'desc es' },
	},
	links,
});

describe('TursoProjectRepository', () => {
	let repo: ProjectRepository;

	beforeEach(async () => {
		const db = drizzle(createClient({ url: ':memory:' }));
		await migrate(db, { migrationsFolder: './drizzle' });
		repo = createTursoProjectRepository(db);
	});

	it('starts empty', async () => {
		expect(await repo.listProjects()).toEqual([]);
	});

	it('creates a project and reads it back by id and by slug', async () => {
		const links = [{ type: 'github' as const, label: 'Code', url: 'https://github.com/a/b' }];
		const id = await repo.createProject(project('alpha', links));
		const byId = await repo.getProject(id);
		expect(byId).toMatchObject({ id, ...project('alpha', links) });
		expect(await repo.getProjectBySlug('alpha')).toEqual(byId);
		expect(await repo.getProjectBySlug('missing')).toBeNull();
	});

	it('puts newly created projects first', async () => {
		await repo.createProject(project('old'));
		await repo.createProject(project('new'));
		expect((await repo.listProjects()).map((p) => p.slug)).toEqual(['new', 'old']);
	});

	it('updates fields, translations and replaces links', async () => {
		const id = await repo.createProject(project('alpha', [{ type: 'link', label: 'A', url: 'https://a.co' }]));
		const changed: ProjectInput = {
			...project('alpha-2'),
			company: 'Other',
			translations: { ...project('x').translations, es: { title: 'Nuevo', summary: 's', description: '' } },
			links: [{ type: 'github', label: 'B', url: 'https://b.co' }, { type: 'link', label: 'C', url: 'https://c.co' }],
		};
		await repo.updateProject(id, changed);
		expect(await repo.getProject(id)).toEqual({ id, ...changed });
	});

	it('deletes a project with its translations and links', async () => {
		const id = await repo.createProject(project('alpha', [{ type: 'link', label: 'A', url: 'https://a.co' }]));
		await repo.deleteProject(id);
		expect(await repo.getProject(id)).toBeNull();
		expect(await repo.listProjects()).toEqual([]);
		// Recreating the same slug works (no leftover rows).
		await expect(repo.createProject(project('alpha'))).resolves.toBeTypeOf('number');
	});

	it('reorders projects to the given id order', async () => {
		const a = await repo.createProject(project('a'));
		const b = await repo.createProject(project('b'));
		const c = await repo.createProject(project('c'));
		await repo.reorderProjects([a, c, b]);
		expect((await repo.listProjects()).map((p) => p.slug)).toEqual(['a', 'c', 'b']);
	});

	it('rejects a duplicated slug', async () => {
		await repo.createProject(project('alpha'));
		await expect(repo.createProject(project('alpha'))).rejects.toThrow();
	});
});
