import { jwtVerify, SignJWT } from 'jose';

export const SESSION_COOKIE = 'admin_session';
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 days

// Pure functions (no next/headers) so they run in proxy.ts, server actions and tests.
const encode = (secret: string) => new TextEncoder().encode(secret);

export async function createSessionToken(secret: string): Promise<string> {
	return new SignJWT({ role: 'admin' })
		.setProtectedHeader({ alg: 'HS256' })
		.setIssuedAt()
		.setExpirationTime(`${SESSION_MAX_AGE_SECONDS}s`)
		.sign(encode(secret));
}

export async function verifySessionToken(
	token: string | undefined,
	secret: string | undefined,
): Promise<boolean> {
	if (!token || !secret) return false;
	try {
		const { payload } = await jwtVerify(token, encode(secret), { algorithms: ['HS256'] });
		return payload.role === 'admin';
	} catch {
		return false;
	}
}
