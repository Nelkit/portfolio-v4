'use server';

import { cookies, headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifyPassword } from '@/app/lib/auth/password';
import { clientIp, getLoginRateLimiter } from '@/app/lib/auth/rate-limit';
import {
	createSessionToken,
	SESSION_COOKIE,
	SESSION_MAX_AGE_SECONDS,
} from '@/app/lib/auth/session';

export type LoginState = { error?: string };

const FAILED_LOGIN_DELAY_MS = 800;
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function login(_prev: LoginState, formData: FormData): Promise<LoginState> {
	const secret = process.env.AUTH_SECRET;
	const storedHash = process.env.ADMIN_PASSWORD_HASH;
	if (!secret || !storedHash) {
		return { error: 'Admin auth is not configured (AUTH_SECRET / ADMIN_PASSWORD_HASH).' };
	}

	// Checked BEFORE the password: a blocked client cannot keep probing (or make us run scrypt).
	const { allowed, retryAfterSeconds } = await getLoginRateLimiter().attempt(`login:${clientIp(await headers())}`);
	if (!allowed) {
		return { error: `Too many attempts. Try again in ${Math.ceil(retryAfterSeconds / 60)} min.` };
	}

	const password = formData.get('password');
	const valid = typeof password === 'string' && (await verifyPassword(password, storedHash));
	if (!valid) {
		await sleep(FAILED_LOGIN_DELAY_MS); // slows down brute force attempts
		return { error: 'Invalid password.' };
	}

	(await cookies()).set(SESSION_COOKIE, await createSessionToken(secret), {
		httpOnly: true,
		secure: process.env.NODE_ENV === 'production',
		sameSite: 'lax',
		path: '/admin',
		maxAge: SESSION_MAX_AGE_SECONDS,
	});
	redirect('/admin');
}

export async function logout(): Promise<void> {
	(await cookies()).delete({ name: SESSION_COOKIE, path: '/admin' });
	redirect('/admin/login');
}
