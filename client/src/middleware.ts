import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  const path = url.pathname;

  const sessionCookie = request.cookies.get('hlg_session')?.value;
  const roleCookie = request.cookies.get('hlg_role')?.value;

  const isAdminRoute = path.startsWith('/admin');
  const isStaffRoute = path.startsWith('/staff');
  const isDashboardRoute = path.startsWith('/dashboard');

  // 1. Route Protection: Require session for Admin and Staff areas
  if (isAdminRoute || isStaffRoute || isDashboardRoute) {
    if (!sessionCookie) {
      url.pathname = '/login';
      url.searchParams.set('redirect', path);
      return NextResponse.redirect(url);
    }

    // Role Enforcement: Only ADMIN role can access /admin routes
    if (isAdminRoute && roleCookie !== 'ADMIN') {
      url.pathname = '/staff';
      url.search = '';
      return NextResponse.redirect(url);
    }
  }

  // 2. Already Logged In: Redirect away from /login to active dashboard
  if (path === '/login' && sessionCookie) {
    if (roleCookie === 'ADMIN') {
      url.pathname = '/admin';
      return NextResponse.redirect(url);
    } else {
      url.pathname = '/staff';
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/staff/:path*',
    '/dashboard/:path*',
    '/login',
  ],
};
