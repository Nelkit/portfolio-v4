import type { EducationInput, EducationRecord } from './education';

/** Port for education entries. Implementations THROW on infrastructure errors. */
export interface EducationRepository {
	/** In-progress entries first, then newest first. */
	listEntries(): Promise<EducationRecord[]>;
	getEntry(id: number): Promise<EducationRecord | null>;
	createEntry(input: EducationInput): Promise<number>;
	updateEntry(id: number, input: EducationInput): Promise<void>;
	deleteEntry(id: number): Promise<void>;
}
