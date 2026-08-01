import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, COOKIE_NAME, type UserRole } from '@/lib/auth';

export async function middleware(req: NextRequest) {
  const token = req.cookies.get(COOKIE_NAME)?.value;
  const pathname = req.nextUrl.pathname;

  const isAdminRoute = pathname.startsWith('/admin');
  const isPortalRoute = pathname.startsWith('/portal') || pathname.startsWith('/(portal)');
  const isLoginPage = pathname === '/login';

  // Only guard routes that need auth
  if (!isAdminRoute && !isPortalRoute && !isLoginPage) {
    return NextResponse.next();
  }

  const user = token ? await verifyToken(token) : null;

  // ── Protected routes without a valid token → redirect to login
  if ((isAdminRoute || isPortalRoute) && !user) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  // ── Admin trying to access portal → redirect to admin dashboard
  if (isPortalRoute && user && user.role === 'admin') {
    return NextResponse.redirect(new URL('/admin/dashboard', req.url));
  }

  // ── Client trying to access admin → redirect to portal dashboard
  if (isAdminRoute && user && user.role === 'client') {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  // ── Login page when already authenticated → redirect to role dashboard
  if (isLoginPage && user) {
    const redirectPath = user.role === 'admin' ? '/admin/dashboard' : '/dashboard';
    return NextResponse.redirect(new URL(redirectPath, req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/portal/:path*', '/(portal)/:path*', '/login'],
};
