// Authentication middleware for control panel
import { NextRequest, NextResponse } from 'next/server';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Skip auth check for login page and public assets
  if (pathname === '/login' || pathname.startsWith('/_next') || pathname.startsWith('/api')) {
    return NextResponse.next();
  }

  // Check for authentication cookie
  const authCookie = request.cookies.get('betx_session');
  
  if (!authCookie) {
    // Redirect to login page if no auth cookie
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - login (login page)
     * - unauthorized (unauthorized page)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|login|unauthorized).*)',
    '/', // Explicitly include root path
  ],
};
