import { beforeEach, describe, expect, it } from 'vitest';
import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import { migrate } from 'drizzle-orm/libsql/migrator';
import { createTursoTagRepository } from './turso-tag-repository';
import { createTursoPostRepository } from '../posts/turso-post-repository';
import type { TagRepository } from './tag-repository';
import type { PostRepository } from '../posts/post-repository';
import type { TagInput } from './tag';

const tag = (slug: string, en = slug.toUpperCase(), es = `${en}-es`): TagInput => ({
	slug,
	translations: { en: { name: en }, es: { name: es } },
});

describe('TursoTagRepository', () => {
	let tags: TagRepository;
	let posts: PostRepository;

	beforeEach(async () => {
		const db = drizzle(createClient({ url: ':memory:' }));
		await migrate(db, { migrationsFolder: './drizzle' });
		tags = createTursoTagRepository(db);
		posts = createTursoPostRepository(db);
	});

	const post = (slug: string, tagIds: number[]) => ({
		slug,
		publishedOn: '2026-01-01',
		tagIds,
		translations: { en: { title: slug, summary: '', body: 'b' } },
	});

	it('creates, lists, renames and finds tags', async () => {
		const ml = await tags.createTag(tag('ml'));
		const web = await tags.createTag(tag('web'));
		expect((await tags.listTags()).map((t) => t.slug).sort()).toEqual(['ml', 'web']);
		await tags.updateTag(ml, tag('ai', 'AI', 'IA'));
		expect(await tags.getTag(ml)).toEqual({ id: ml, ...tag('ai', 'AI', 'IA') });
		expect(await tags.getTagBySlug('web')).toEqual({ id: web, ...tag('web') });
		await expect(tags.createTag(tag('web'))).rejects.toThrow();
	});

	it('stores the tags of a post and replaces them on update', async () => {
		const ml = await tags.createTag(tag('ml'));
		const web = await tags.createTag(tag('web'));
		const id = await posts.createPost(post('p', [ml, web]));
		expect((await posts.getPost(id))?.tagIds.sort()).toEqual([ml, web].sort());
		await posts.updatePost(id, post('p', [web]));
		expect((await posts.getPost(id))?.tagIds).toEqual([web]);
	});

	it('deleting a tag removes it from posts but keeps the posts', async () => {
		const ml = await tags.createTag(tag('ml'));
		const web = await tags.createTag(tag('web'));
		const id = await posts.createPost(post('p', [ml, web]));
		await tags.deleteTag(ml);
		expect(await tags.getTag(ml)).toBeNull();
		expect((await posts.getPost(id))?.tagIds).toEqual([web]);
	});

	it('deleting a post removes its tag links', async () => {
		const ml = await tags.createTag(tag('ml'));
		const id = await posts.createPost(post('p', [ml]));
		await posts.deletePost(id);
		await expect(posts.createPost(post('p', [ml]))).resolves.toBeTypeOf('number');
	});
});
