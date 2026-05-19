import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Requirement 6.1: Protected paths that require authentication
const protectedPaths = [
  '/dashboard',
  '/text-to-speech',
  '/reading-assistant',
  '/writing-assistant',
  '/chat-assistant',
  '/flashcards',
  '/quizzes',
  '/materials',
  '/goals',
  '/settings',
];

// Requirement 6.4: Auth routes that should be excluded from protection
const authPaths = [
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
  '/verify-email',
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Add custom headers for API routes (AI Proxy Logic)
  if (pathname.startsWith('/api/ai')) {
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-lexi-internal-caller', 'frontend-proxy');

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  }

  // Check if the current path is a protected route
  const isProtectedRoute = protectedPaths.some(path => pathname.startsWith(path));
  
  if (isProtectedRoute) {
    // Note: Requirement 6.5 - Token validation happens client-side
    // JWT tokens are stored in localStorage (via Zustand persist), which is not
    // accessible in middleware (server-side). Therefore, middleware marks the route
    // as protected, but actual authentication check and redirect happens in the
    // client-side layout component (src/app/(main)/layout.tsx).
    
    // Requirement 6.2: The redirect with original URL will be handled client-side
    // in the (main) layout after checking authentication state
  }

  return NextResponse.next();
}

// Configure matcher - run middleware on all routes except static files
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\..*|api/(?!ai)).*)',
    '/api/ai/:path*',
  ],
};
