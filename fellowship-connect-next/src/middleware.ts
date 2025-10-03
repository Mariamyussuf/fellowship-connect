import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Define which routes are protected
const protectedRoutes = ['/dashboard', '/profile', '/admin', '/api'];
const authRoutes = ['/login', '/register'];

// Public API routes that don't require authentication
const publicApiRoutes = [
  '/api/auth/signup',
  '/api/auth/login',
  '/api/auth/reset-password',
  '/api/auth/verify-email'
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Check if the route is protected
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
  const isAuthRoute = authRoutes.some(route => pathname.startsWith(route));
  const isPublicApiRoute = publicApiRoutes.some(route => pathname.startsWith(route));
  
  // Skip middleware for public API routes
  if (isPublicApiRoute) {
    return NextResponse.next();
  }
  
  // For protected routes, we need to check if user is authenticated
  if (isProtectedRoute) {
    // Get the session cookie from request headers
    const sessionCookie = request.cookies.get('session')?.value;
    
    if (!sessionCookie) {
      // Redirect to login if no session cookie
      const url = request.nextUrl.clone();
      url.pathname = '/login';
      return NextResponse.redirect(url);
    }
    
    try {
      // Dynamically import firebase admin only when needed to avoid edge runtime issues
      const { auth } = await import('./lib/firebaseAdmin');
      
      // Check if auth is available
      if (!auth) {
        const url = request.nextUrl.clone();
        url.pathname = '/login';
        return NextResponse.redirect(url);
      }
      
      // Verify the session cookie
      const decodedClaims = await auth.verifySessionCookie(sessionCookie, true /** checkRevoked */);
      
      // Add user info to headers for downstream use
      const response = NextResponse.next();
      response.headers.set('x-user-id', decodedClaims.uid);
      response.headers.set('x-user-role', decodedClaims.role || 'member');
      
      return response;
    } catch (error) {
      console.error('Authentication error:', error);
      // If verification fails, redirect to login
      const url = request.nextUrl.clone();
      url.pathname = '/login';
      return NextResponse.redirect(url);
    }
  }

  // If logged in and trying to access auth routes, redirect to dashboard
  if (isAuthRoute) {
    const sessionCookie = request.cookies.get('session')?.value;
    
    if (sessionCookie) {
      try {
        // Dynamically import firebase admin only when needed to avoid edge runtime issues
        const { auth } = await import('./lib/firebaseAdmin');
        
        // Check if auth is available
        if (!auth) {
          return NextResponse.next();
        }
        
        // Verify the session cookie
        await auth.verifySessionCookie(sessionCookie, true /** checkRevoked */);
        
        // Redirect authenticated users away from auth pages
        const url = request.nextUrl.clone();
        url.pathname = '/dashboard';
        return NextResponse.redirect(url);
      } catch (error) {
        console.error('Authentication check error:', error);
        // If verification fails, allow access to auth routes
        // The invalid cookie will be handled by the auth routes
      }
    }
  }

  return NextResponse.next();
}

// Configure which paths the middleware should run on
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};