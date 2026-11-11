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
const stored = (id: number, input: PostInput, coverKey: string | null = null) => ({ id, ...input, coverKey });

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
		expect(byId).toEqual(stored(id, post('hello', '2026-01-05', ['es'])));
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
		expect(await repo.getPost(id)).toEqual(stored(id, post('hello-2', '2026-01-06', ['en'])));
	});

	it('sets/replaces the cover (returning the previous key) and keeps it on text updates', async () => {
		const id = await repo.createPost(post('hello', '2026-01-05'));
		expect(await repo.setPostCover(id, 'posts/1/cover-a.webp')).toBeNull();
		expect(await repo.setPostCover(id, 'posts/1/cover-b.webp')).toBe('posts/1/cover-a.webp');
		await repo.updatePost(id, post('hello', '2026-01-07'));
		expect((await repo.getPost(id))?.coverKey).toBe('posts/1/cover-b.webp');
	});

	it('keeps a library of uploaded images per post', async () => {
		const a = await repo.createPost(post('a', '2026-01-05'));
		const b = await repo.createPost(post('b', '2026-01-05'));
		const img1 = await repo.addPostImage(a, 'posts/1/img-1.png');
		const img2 = await repo.addPostImage(a, 'posts/1/img-2.png');
		expect(await repo.listPostImages(a)).toEqual([{ id: img1, key: 'posts/1/img-1.png' }, { id: img2, key: 'posts/1/img-2.png' }]);
		expect(await repo.removePostImage(b, img1)).toBeNull(); // not b's image
		expect(await repo.removePostImage(a, img1)).toBe('posts/1/img-1.png');
		expect((await repo.listPostImages(a)).map((i) => i.id)).toEqual([img2]);
	});

	it('returns every file key (cover + images) when a post is deleted', async () => {
		const id = await repo.createPost(post('hello', '2026-01-05'));
		await repo.setPostCover(id, 'posts/1/cover.webp');
		await repo.addPostImage(id, 'posts/1/img-1.png');
		expect((await repo.deletePost(id)).sort()).toEqual(['posts/1/cover.webp', 'posts/1/img-1.png']);
		expect(await repo.deletePost(id)).toEqual([]);
	});

	it('deletes a post with its translations and rejects duplicated slugs', async () => {
		const id = await repo.createPost(post('hello', '2026-01-05'));
		await expect(repo.createPost(post('hello', '2026-01-06'))).rejects.toThrow();
		await repo.deletePost(id);
		expect(await repo.getPost(id)).toBeNull();
		await expect(repo.createPost(post('hello', '2026-01-06'))).resolves.toBeTypeOf('number');
	});
});
