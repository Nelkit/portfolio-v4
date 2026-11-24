import type { AreaInput, AreaRecord } from './area';

/** Port for expertise areas. Implementations THROW on infrastructure errors. */
export interface AreaRepository {
	/** All areas in display order. */
	listAreas(): Promise<AreaRecord[]>;
	getArea(id: number): Promise<AreaRecord | null>;
	/** Appends the area at the end; returns its id. */
	createArea(input: AreaInput): Promise<number>;
	updateArea(id: number, input: AreaInput): Promise<void>;
	/** Deletes the area only if no project uses it (a project always has one). */
	deleteArea(id: number): Promise<{ deleted: boolean; projects: number }>;
	reorderAreas(ids: number[]): Promise<void>;
}
