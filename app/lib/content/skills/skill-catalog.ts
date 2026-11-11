import { and, eq, notInArray, sql } from 'drizzle-orm';
import type { LibSQLDatabase } from 'drizzle-orm/libsql';
import { projectSkills, skillCategorySkills, skills } from '@/app/lib/db/schema';

/**
 * The skill catalog is shared by tech-stack categories and projects.
 * Both repositories resolve names and clean up through this module, so the
 * "is this skill still used?" rule lives in ONE place.
 */
export type Tx = Parameters<Parameters<LibSQLDatabase['transaction']>[0]>[0];

/** Finds each name in the catalog (case-insensitive) or creates it; returns ids in input order. */
export async function resolveSkillIds(tx: Tx, names: string[]): Promise<number[]> {
	const ids: number[] = [];
	for (const name of names) {
		const [existing] = await tx
			.select({ id: skills.id })
			.from(skills)
			.where(eq(sql`lower(${skills.name})`, name.toLowerCase()))
			.limit(1);
		if (existing) ids.push(existing.id);
		else {
			const [created] = await tx.insert(skills).values({ name }).returning({ id: skills.id });
			ids.push(created.id);
		}
	}
	return ids;
}

/** Deletes catalog skills used by no category AND no project. */
export async function deleteOrphanSkills(tx: Tx) {
	const inCategories = tx.select({ id: skillCategorySkills.skillId }).from(skillCategorySkills);
	const inProjects = tx.select({ id: projectSkills.skillId }).from(projectSkills);
	await tx.delete(skills).where(and(notInArray(skills.id, inCategories), notInArray(skills.id, inProjects)));
}
