import { NextRequest, NextResponse } from 'next/server';

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  
  console.log('🔍 Middleware processing:', pathname);
  
  // TEMPORARY: BYPASS ALL AUTHENTICATION - Remove this in production!
  console.log('🚀 BYPASS MODE: Allowing all requests without authentication');
  
  // Allow API routes and static files
  if (pathname.startsWith('/api/')) {
    console.log('✅ Allowing API route:', pathname);
    return NextResponse.next();
  }
  
  if (pathname.startsWith('/_next/') || pathname.startsWith('/favicon.ico')) {
    console.log('✅ Allowing static file:', pathname);
    return NextResponse.next();
  }
  
  // Allow root path to show dashboard (no redirect needed)
  if (pathname === '/') {
    console.log('🏠 Allowing access to dashboard');
    return NextResponse.next();
  }
  
  // Allow all other pages without authentication
  console.log('✅ BYPASS: Allowing access to:', pathname);
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
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
}; 