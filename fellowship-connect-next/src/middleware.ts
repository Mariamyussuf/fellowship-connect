import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

interface VerifiedUser {
  id: string;
  role: string;
  email?: string;
}

interface VerificationResult {
  success: boolean;
  user?: VerifiedUser;
}

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

async function verifySession(request: NextRequest): Promise<VerificationResult> {
  const sessionCookie = request.cookies.get('session')?.value;

  if (!sessionCookie) {
    return { success: false };
  }

  try {
    const verifyUrl = new URL('/api/auth/verify', request.nextUrl.origin);

    const verifyResponse = await fetch(verifyUrl, {
      method: 'GET',
      headers: {
        cookie: request.headers.get('cookie') ?? ''
      },
      cache: 'no-store'
    });

    if (!verifyResponse.ok) {
      return { success: false };
    }

    const data = (await verifyResponse.json()) as VerificationResult;
    return data;
  } catch (error) {
    console.error('Failed to verify session via API:', error);
    return { success: false };
  }
}

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

  if (isProtectedRoute) {
    const verification = await verifySession(request);

    if (!verification.success || !verification.user) {
      const url = request.nextUrl.clone();
      url.pathname = '/login';
      return NextResponse.redirect(url);
    }

    const response = NextResponse.next();
    response.headers.set('x-user-id', verification.user.id);
    response.headers.set('x-user-role', verification.user.role || 'member');

    if (verification.user.email) {
      response.headers.set('x-user-email', verification.user.email);
    }

    return response;
  }

  if (isAuthRoute) {
    const verification = await verifySession(request);

    if (verification.success) {
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