import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, COOKIE_NAME } from '@/lib/auth';

export async function middleware(req: NextRequest) {
  const token = req.cookies.get(COOKIE_NAME)?.value;
  const isAdminRoute = req.nextUrl.pathname.startsWith('/admin');
  const isLoginPage = req.nextUrl.pathname === '/login';

  if (isAdminRoute) {
    const user = token ? await verifyToken(token) : null;
    if (!user) {
      return NextResponse.redirect(new URL('/login', req.url));
    }
  }

  if (isLoginPage) {
    const user = token ? await verifyToken(token) : null;
    if (user) {
      return NextResponse.redirect(new URL('/admin/dashboard', req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/login'],
};
