import type { ProjectInput, ProjectRecord } from './project';

/**
 * Port for project storage. Implementations must THROW on infrastructure
 * errors (never return an empty result), so cached pages stay intact.
 */
export interface ProjectRepository {
	/** All projects in display order (position ascending). */
	listProjects(): Promise<ProjectRecord[]>;
	getProject(id: number): Promise<ProjectRecord | null>;
	getProjectBySlug(slug: string): Promise<ProjectRecord | null>;
	/** New projects go first. Throws if the slug is already taken. Returns the new id. */
	createProject(input: ProjectInput): Promise<number>;
	/** Replaces fields, translations and links atomically. */
	updateProject(id: number, input: ProjectInput): Promise<void>;
	deleteProject(id: number): Promise<void>;
	/** Sets the display order to the given id order. */
	reorderProjects(ids: number[]): Promise<void>;
}
