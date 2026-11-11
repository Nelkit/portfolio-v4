import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { SESSION_COOKIE, verifySessionToken } from './session';

export async function isAdmin(): Promise<boolean> {
	const token = (await cookies()).get(SESSION_COOKIE)?.value;
	return verifySessionToken(token, process.env.AUTH_SECRET);
}

/**
 * Call at the top of EVERY admin page and server action. proxy.ts only
 * redirects navigation — server actions are POST endpoints and must
 * authorize themselves.
 */
export async function requireAdmin(): Promise<void> {
	if (!(await isAdmin())) redirect('/admin/login');
}
