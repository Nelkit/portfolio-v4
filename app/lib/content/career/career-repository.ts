import type { CareerInput, CareerRecord } from './career';

/** Port for the career timeline. Implementations THROW on infrastructure errors. */
export interface CareerRepository {
	/** All entries: current roles first, then newest first. */
	listEntries(): Promise<CareerRecord[]>;
	getEntry(id: number): Promise<CareerRecord | null>;
	createEntry(input: CareerInput): Promise<number>;
	updateEntry(id: number, input: CareerInput): Promise<void>;
	deleteEntry(id: number): Promise<void>;
}
