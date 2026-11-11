import { beforeEach, describe, expect, it } from 'vitest';
import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import { migrate } from 'drizzle-orm/libsql/migrator';
import { createTursoPostRepository } from './turso-post-repository';
import type { PostRepository } from './post-repository';
import type { PostInput } from './post';

const post = (slug: string, publishedOn: string, langs: ('en' | 'es')[] = ['en', 'es']): PostInput => ({
	slug,
	publishedOn,
	translations: Object.fromEntries(langs.map((l) => [l, { title: `${slug}-${l}`, summary: '', body: `# ${l}` }])),
});

describe('TursoPostRepository', () => {
	let repo: PostRepository;

	beforeEach(async () => {
		const db = drizzle(createClient({ url: ':memory:' }));
		await migrate(db, { migrationsFolder: './drizzle' });
		repo = createTursoPostRepository(db);
	});

	it('creates posts and reads them by id and slug', async () => {
		const id = await repo.createPost(post('hello', '2026-01-05', ['es']));
		const byId = await repo.getPost(id);
		expect(byId).toEqual({ id, ...post('hello', '2026-01-05', ['es']) });
		expect(await repo.getPostBySlug('hello')).toEqual(byId);
		expect(await repo.getPostBySlug('nope')).toBeNull();
	});

	it('lists posts newest first', async () => {
		await repo.createPost(post('old', '2025-06-01'));
		await repo.createPost(post('new', '2026-02-01'));
		expect((await repo.listPosts()).map((p) => p.slug)).toEqual(['new', 'old']);
	});

	it('updates fields and can drop a language', async () => {
		const id = await repo.createPost(post('hello', '2026-01-05', ['en', 'es']));
		await repo.updatePost(id, post('hello-2', '2026-01-06', ['en']));
		expect(await repo.getPost(id)).toEqual({ id, ...post('hello-2', '2026-01-06', ['en']) });
	});

	it('deletes a post with its translations and rejects duplicated slugs', async () => {
		const id = await repo.createPost(post('hello', '2026-01-05'));
		await expect(repo.createPost(post('hello', '2026-01-06'))).rejects.toThrow();
		await repo.deletePost(id);
		expect(await repo.getPost(id)).toBeNull();
		await expect(repo.createPost(post('hello', '2026-01-06'))).resolves.toBeTypeOf('number');
	});
});
