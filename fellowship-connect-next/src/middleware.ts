import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Define which routes are protected
const protectedRoutes = ['/dashboard', '/profile', '/admin'];
const authRoutes = ['/login', '/register'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Check if the route is protected
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
  const isAuthRoute = authRoutes.some(route => pathname.startsWith(route));

  // For protected routes, we need to check if user is authenticated
  if (isProtectedRoute) {
    // In middleware, we can't directly access Firebase auth state
    // We'll check for the presence of auth cookies/session tokens
    const sessionCookie = request.cookies.get('session')?.value;
    
    if (!sessionCookie) {
      // Redirect to login if no session cookie
      const url = request.nextUrl.clone();
      url.pathname = '/login';
      return NextResponse.redirect(url);
    }
    
    // Note: Full validation of session cookie would require server-side verification
    // This is a simplified approach - in production, you'd verify the cookie with Firebase Admin SDK
  }

  // If logged in and trying to access auth routes, redirect to dashboard
  if (isAuthRoute) {
    const sessionCookie = request.cookies.get('session')?.value;
    
    if (sessionCookie) {
      // Redirect authenticated users away from auth pages
      const url = request.nextUrl.clone();
      url.pathname = '/dashboard';
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

// Configure which paths the middleware should run on
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};