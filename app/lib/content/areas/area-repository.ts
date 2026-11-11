import type { AreaInput, AreaRecord } from './area';

/** Port for expertise areas. Implementations THROW on infrastructure errors. */
export interface AreaRepository {
	/** All areas in display order. */
	listAreas(): Promise<AreaRecord[]>;
	getArea(id: number): Promise<AreaRecord | null>;
	/** Appends the area at the end; returns its id. */
	createArea(input: AreaInput): Promise<number>;
	updateArea(id: number, input: AreaInput): Promise<void>;
	/** Deletes the area; its projects keep existing, without area. */
	deleteArea(id: number): Promise<void>;
	reorderAreas(ids: number[]): Promise<void>;
}
