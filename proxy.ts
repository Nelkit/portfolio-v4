import { NextResponse, type NextRequest } from 'next/server';
import { SESSION_COOKIE, verifySessionToken } from '@/app/lib/auth/session';
import {
	getLocaleFromPathname,
	LOCALE_COOKIE,
	localizePath,
	negotiateLocale,
} from '@/app/lib/i18n/routing';

const LOGIN_PATH = '/admin/login';

export async function proxy(request: NextRequest) {
	const { pathname } = request.nextUrl;
	if (pathname === '/admin' || pathname.startsWith('/admin/')) return guardAdmin(request);
	return routeLocale(request);
}

// First line of defense for /admin navigation. Pages and server actions
// still call requireAdmin() themselves (defense in depth).
async function guardAdmin(request: NextRequest) {
	const { pathname } = request.nextUrl;
	const token = request.cookies.get(SESSION_COOKIE)?.value;
	const authenticated = await verifySessionToken(token, process.env.AUTH_SECRET);

	if (pathname === LOGIN_PATH) {
		return authenticated
			? NextResponse.redirect(new URL('/admin', request.url))
			: NextResponse.next();
	}

	if (!authenticated) {
		return NextResponse.redirect(new URL(LOGIN_PATH, request.url));
	}
	return NextResponse.next();
}

// Public site: every page lives under /en or /es. URLs without a locale
// ("/", "/blog/x", old links) redirect to the visitor's language:
// explicit choice (cookie) > browser preference > English.
function routeLocale(request: NextRequest) {
	const { pathname, search } = request.nextUrl;
	if (getLocaleFromPathname(pathname)) return NextResponse.next();

	const locale = negotiateLocale({
		cookie: request.cookies.get(LOCALE_COOKIE)?.value,
		acceptLanguage: request.headers.get('accept-language'),
	});
	const response = NextResponse.redirect(new URL(localizePath(locale, pathname + search), request.url));
	// The target depends on cookie + Accept-Language: never let a CDN share it.
	response.headers.set('Cache-Control', 'private, no-store');
	response.headers.set('Vary', 'Cookie, Accept-Language');
	return response;
}

export const config = {
	// Everything except API routes, Next internals and files with an extension
	// (favicon.ico, /img/logo.webp, …).
	matcher: ['/((?!api|_next/static|_next/image|.*\\..*).*)'],
};
