// Authentication middleware for user panel
import { NextRequest, NextResponse } from 'next/server';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Skip auth check for login page, public assets, and static files
  if (
    pathname === '/login' || 
    pathname.startsWith('/_next') || 
    pathname.startsWith('/api') ||
    pathname.startsWith('/images/') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.match(/\.(png|jpg|jpeg|gif|svg|ico|css|js)$/) ||
    pathname.startsWith('/_next/data/')
  ) {
    return NextResponse.next();
  }

  // Check for authentication cookie
  const sessionCookie = request.cookies.get('betx_session');
  
  if (!sessionCookie) {
    // No session cookie, redirect to login
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // If we have a session cookie, let the page handle authentication
  // This prevents middleware redirect loops
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - _next/data (Next.js data requests)
     * - favicon.ico (favicon file)
     * - login (login page)
     * - unauthorized (unauthorized page)
     * - images (image files)
     * - static files (css, js, png, jpg, etc.)
     */
    '/((?!api|_next/static|_next/image|_next/data|favicon.ico|login|unauthorized|images).*)',
    '/', // Explicitly include root path
  ],
};
