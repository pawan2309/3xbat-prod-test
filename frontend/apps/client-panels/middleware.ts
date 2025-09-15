// Authentication middleware for client panels
import { NextRequest, NextResponse } from 'next/server';
import { authService } from './lib/auth';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Skip auth check for login page, root page, dashboard, and other main routes
  if (pathname === '/login' || 
      pathname === '/' ||
      pathname === '/dashboard' ||
      pathname === '/cricket' ||
      pathname === '/casino' ||
      pathname === '/profile' ||
      pathname === '/myBets' ||
      pathname === '/ledger' ||
      pathname === '/client-Statement' ||
      pathname === '/change-password' ||
      pathname.startsWith('/_next') || 
      pathname.startsWith('/api') ||
      pathname.startsWith('/_next/static') ||
      pathname.startsWith('/_next/image') ||
      pathname.match(/\.(jpg|jpeg|png|gif|ico|svg|css|js|woff|woff2|ttf|eot)$/)) {
    return NextResponse.next();
  }

  // Check if user is authenticated
  try {
    const isAuthenticated = await authService.checkSession();
    
    if (!isAuthenticated) {
      // Check if there's a login success flag in the request headers
      const loginSuccess = request.headers.get('x-login-success');
      if (loginSuccess === 'true') {
        console.log('Login success flag found, allowing access');
        return NextResponse.next();
      }
      
      // Redirect to login page
      return NextResponse.redirect(new URL('/login', request.url));
    }
  } catch (error) {
    console.error('Middleware session check error:', error);
    // If session check fails, redirect to login as fallback
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
