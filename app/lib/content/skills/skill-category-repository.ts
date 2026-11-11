import type { CategoryInput, CategoryRecord, Skill } from './skill-category';

/** Port for the tech stack (categories + skill catalog). Implementations THROW on infrastructure errors. */
export interface SkillCategoryRepository {
	/** All categories in display order, each with its ordered skills. */
	listCategories(): Promise<CategoryRecord[]>;
	getCategory(id: number): Promise<CategoryRecord | null>;
	/** Appends the category; skill names are matched to the catalog (case-insensitive) or created. */
	createCategory(input: CategoryInput): Promise<number>;
	updateCategory(id: number, input: CategoryInput): Promise<void>;
	deleteCategory(id: number): Promise<void>;
	reorderCategories(ids: number[]): Promise<void>;
	/** The whole skill catalog, sorted by name. */
	listSkills(): Promise<Skill[]>;
}
