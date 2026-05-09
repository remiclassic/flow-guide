import createMiddleware from 'next-intl/middleware';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { sessionCookieBase } from '@/lib/auth/cookie-options';
import { signToken, verifyToken } from '@/lib/auth/session';
import type { Locale } from '@/i18n/routing';
import { routing } from '@/i18n/routing';
import {
  localizedPublicSegments,
  localeDashboardPrefix,
} from '@/i18n/middleware-paths';
import { isCourseStaffRole } from '@/lib/db/schema';

const intlMiddleware = createMiddleware(routing);

function resolveLocale(request: NextRequest): Locale {
  const fromCookie = request.cookies.get('NEXT_LOCALE')?.value;
  if (fromCookie === 'en' || fromCookie === 'es') return fromCookie;
  return routing.defaultLocale;
}

function localeFromPath(pathname: string): Locale | null {
  const first = pathname.split('/')[1];
  if (first === 'es' || first === 'en') return first;
  return null;
}

function legacyRedirect(request: NextRequest): NextResponse | null {
  const pathname = request.nextUrl.pathname;
  const locale = resolveLocale(request);
  const segs = localizedPublicSegments(locale);

  if (pathname === '/dashboard' || pathname.startsWith('/dashboard/')) {
    const url = request.nextUrl.clone();
    url.pathname = `/${locale}${pathname}`;
    return NextResponse.redirect(url);
  }

  if (pathname === '/sign-in') {
    return NextResponse.redirect(
      new URL(`/${locale}${segs.signIn}`, request.url)
    );
  }
  if (pathname === '/sign-up') {
    return NextResponse.redirect(
      new URL(`/${locale}${segs.signUp}`, request.url)
    );
  }
  if (pathname === '/pricing') {
    return NextResponse.redirect(
      new URL(`/${locale}${segs.pricing}`, request.url)
    );
  }
  if (pathname === '/courses') {
    const url = request.nextUrl.clone();
    url.pathname = `/${locale}/courses`;
    return NextResponse.redirect(url);
  }

  return null;
}

function sessionHasRole(
  user: unknown
): user is { id: number; role: string } {
  return (
    typeof user === 'object' &&
    user !== null &&
    'role' in user &&
    typeof (user as { role: unknown }).role === 'string' &&
    'id' in user &&
    typeof (user as { id: unknown }).id === 'number'
  );
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  if (pathname.startsWith('/admin')) {
    const sessionCookie = request.cookies.get('session');
    if (!sessionCookie) {
      const locale = resolveLocale(request);
      const segs = localizedPublicSegments(locale);
      return NextResponse.redirect(
        new URL(`/${locale}${segs.signIn}`, request.url)
      );
    }

    try {
      const parsed = await verifyToken(sessionCookie.value);
      if (
        !sessionHasRole(parsed.user) ||
        !isCourseStaffRole(parsed.user.role)
      ) {
        const locale = resolveLocale(request);
        return NextResponse.redirect(
          new URL(localeDashboardPrefix(locale), request.url)
        );
      }
    } catch {
      const locale = resolveLocale(request);
      const segs = localizedPublicSegments(locale);
      const res = NextResponse.redirect(
        new URL(`/${locale}${segs.signIn}`, request.url)
      );
      res.cookies.delete('session');
      return res;
    }

    const res = NextResponse.next();
    if (request.method === 'GET') {
      try {
        const parsed = await verifyToken(sessionCookie.value);
        if (!sessionHasRole(parsed.user)) {
          return res;
        }
        const expiresInOneDay = new Date(Date.now() + 24 * 60 * 60 * 1000);
        res.cookies.set({
          name: 'session',
          value: await signToken({
            user: { id: parsed.user.id, role: parsed.user.role },
            expires: expiresInOneDay.toISOString(),
          }),
          ...sessionCookieBase(expiresInOneDay),
        });
      } catch {
        console.error('Admin session refresh failed');
        res.cookies.delete('session');
        const locale = resolveLocale(request);
        const segs = localizedPublicSegments(locale);
        return NextResponse.redirect(
          new URL(`/${locale}${segs.signIn}`, request.url)
        );
      }
    }
    return res;
  }

  const legacy = legacyRedirect(request);
  if (legacy) return legacy;

  const response = intlMiddleware(request);

  if (response.headers.get('location')) {
    return response;
  }

  const sessionCookie = request.cookies.get('session');
  const locale = localeFromPath(request.nextUrl.pathname);
  const pathWithoutLocale =
    locale != null
      ? pathname.slice(`/${locale}`.length) || '/'
      : pathname;

  const isProtected =
    pathWithoutLocale.startsWith('/dashboard') ||
    pathname.startsWith('/admin');

  if (isProtected && locale != null && !sessionCookie) {
    const segs = localizedPublicSegments(locale);
    return NextResponse.redirect(
      new URL(`/${locale}${segs.signIn}`, request.url)
    );
  }

  if (sessionCookie && request.method === 'GET') {
    try {
      const parsed = await verifyToken(sessionCookie.value);
      if (!sessionHasRole(parsed.user)) {
        return response;
      }
      const expiresInOneDay = new Date(Date.now() + 24 * 60 * 60 * 1000);
      response.cookies.set({
        name: 'session',
        value: await signToken({
          user: { id: parsed.user.id, role: parsed.user.role },
          expires: expiresInOneDay.toISOString(),
        }),
        ...sessionCookieBase(expiresInOneDay),
      });
    } catch (error) {
      console.error('Error updating session:', error);
      response.cookies.delete('session');
      if (isProtected && locale != null) {
        const segs = localizedPublicSegments(locale);
        return NextResponse.redirect(
          new URL(`/${locale}${segs.signIn}`, request.url)
        );
      }
    }
  }

  return response;
}

export const config = {
  matcher: ['/((?!api|_next|_next/static|_next/image|favicon.ico|legacy|.*\\..*).*)']
};
