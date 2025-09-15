// Authentication middleware for client-panels
import { NextRequest, NextResponse } from 'next/server';
import { authService } from '../lib/auth';

export async function authMiddleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Skip auth check for login page and public assets
  if (pathname === '/login' || pathname.startsWith('/_next') || pathname.startsWith('/api')) {
    return NextResponse.next();
  }

  // Check if user is authenticated
  const isAuthenticated = await authService.checkSession();
  
  if (!isAuthenticated) {
    // Redirect to login page
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}
