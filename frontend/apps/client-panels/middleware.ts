import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Define public routes that don't require authentication
const publicRoutes = [
  '/login',
  '/auth',
  '/unauthorized',
  '/api/auth/login',
  '/api/auth/logout',
  '/api/auth/unified-session-check'
]

// Define API routes that don't require authentication
const publicApiRoutes = [
  '/api/auth/',
  '/api/cricket/fixtures',
  '/api/cricket/tv',
  '/api/cricket/odds',
  '/api/cricket/scorecard'
]

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Skip middleware for public routes
  if (publicRoutes.includes(pathname)) {
    return NextResponse.next()
  }

  // Skip middleware for public API routes
  if (publicApiRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.next()
  }

  // Skip middleware for static files
  if (pathname.startsWith('/_next/') || 
      pathname.startsWith('/static/') || 
      pathname.includes('.')) {
    return NextResponse.next()
  }

  // For all other routes, let the client-side authentication handle it
  // The ProtectedRoute component will check authentication and redirect if needed
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}