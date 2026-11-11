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
	/** Deletes the project and returns the storage keys of its files (to delete them). */
	deleteProject(id: number): Promise<string[]>;
	/** Sets the display order to the given id order. */
	reorderProjects(ids: number[]): Promise<void>;

	/** Sets (or clears with null) the main image; returns the previous key. */
	setProjectImage(id: number, key: string | null): Promise<string | null>;
	/** Appends a screenshot at the end; returns its id. */
	addScreenshot(projectId: number, key: string): Promise<number>;
	/** Removes a screenshot of THAT project; returns its key, or null if not found. */
	removeScreenshot(projectId: number, screenshotId: number): Promise<string | null>;
	reorderScreenshots(projectId: number, screenshotIds: number[]): Promise<void>;
}
