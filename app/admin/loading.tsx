import { PageSkeleton } from './components/ui/Skeleton';

/** Shown while any admin page loads its data (all admin pages read the database on request). */
export default function AdminLoading() {
	return <PageSkeleton />;
}
