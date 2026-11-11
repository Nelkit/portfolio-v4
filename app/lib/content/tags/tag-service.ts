import { cachedRead } from '@/app/lib/cache/cached-read';
import { getDb } from '@/app/lib/db/client';
import type { Locale } from '@/app/lib/i18n/locales';
import { toTagView, type TagView } from './tag';
import { createTursoTagRepository } from './turso-tag-repository';
import type { TagRepository } from './tag-repository';

/** Cache tag for every public read that shows tag names (tags AND posts). */
export const TAGS_TAG = 'tags';

export function tagRepository(): TagRepository {
	return createTursoTagRepository(getDb());
}

/** Uncached: tags for one locale. */
export async function loadTagViews(locale: Locale): Promise<TagView[]> {
	return (await tagRepository().listTags())
		.map((record) => toTagView(record, locale))
		.filter((view): view is TagView => view !== null);
}

export const getPublishedTags = cachedRead(loadTagViews, ['tags'], [TAGS_TAG]);
