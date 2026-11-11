import type { ProfileData, ProfileInput } from './profile';

/**
 * Port for profile storage. Implementations must THROW on infrastructure
 * errors (never return an empty result), so cached pages stay intact.
 */
export interface ProfileRepository {
	getProfileData(): Promise<ProfileData | null>;
	/** Saves everything atomically; links are replaced as a whole, in order. */
	saveProfile(input: ProfileInput): Promise<void>;
}
