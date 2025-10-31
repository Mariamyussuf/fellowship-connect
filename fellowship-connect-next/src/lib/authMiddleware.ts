import { NextRequest } from 'next/server';
import { getFirebaseAdmin } from './firebaseAdmin';
import { DecodedIdToken } from 'firebase-admin/auth';

// Define user roles
export type UserRole = 'member' | 'admin' | 'super-admin' | 'chaplain';

// Define the structure of our authenticated user
export interface AuthenticatedUser {
  uid: string;
  email?: string;
  role: UserRole;
  customClaims: {
    role?: UserRole;
    [key: string]: unknown;
  };
}

// Extend the NextRequest type to include our user property
declare module 'next/server' {
  interface NextRequest {
    user?: AuthenticatedUser;
  }
}

// Middleware function to authenticate users
export async function authenticateUser(request: NextRequest): Promise<{
  success: boolean;
  user?: AuthenticatedUser;
  error?: string;
}> {
  try {
    // Get Firebase services
    const { auth } = await getFirebaseAdmin();
    if (!auth) {
      return { 
        success: false, 
        error: 'Authentication service not available' 
      };
    }
    
    // Get the session cookie from request headers
    const sessionCookie = request.cookies.get('session')?.value;
    
    if (!sessionCookie) {
      return { 
        success: false, 
        error: 'No session cookie found' 
      };
    }

    // Verify the session cookie
    const decodedClaims: DecodedIdToken = await auth.verifySessionCookie(sessionCookie, true /** checkRevoked */);
    
    // Get user role from custom claims
    const role = (decodedClaims.role as UserRole) || 'member';
    
    return {
      success: true,
      user: {
        uid: decodedClaims.uid,
        email: decodedClaims.email,
        role: role,
        customClaims: decodedClaims
      }
    };
  } catch (error: unknown) {
    console.error('Authentication error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Authentication failed';
    return { 
      success: false, 
      error: errorMessage
    };
  }
}

// Middleware function to check if user has required role
export async function requireRole(
  request: NextRequest, 
  requiredRoles: UserRole[]
): Promise<{
  success: boolean;
  user?: AuthenticatedUser;
  error?: string;
}> {
  // First authenticate the user
  const authResult = await authenticateUser(request);
  
  if (!authResult.success) {
    return authResult;
  }
  
  const { user } = authResult;
  
  if (!user) {
    return { 
      success: false, 
      error: 'User not found' 
      };
  }
  
  // Check if user has required role
  if (!requiredRoles.includes(user.role)) {
    return { 
      success: false, 
      error: 'Insufficient permissions' 
    };
  }
  
  return {
    success: true,
    user
  };
}

// Helper function to create session cookies
export async function createSessionCookie(idToken: string, expiresIn: number): Promise<string> {
  // Get Firebase services
  const { auth } = await getFirebaseAdmin();
  if (!auth) {
    throw new Error('Authentication service not available');
  }
  
  const _decodedIdToken: DecodedIdToken = await auth.verifyIdToken(idToken);
  
  // Create session cookie
  const sessionCookie = await auth.createSessionCookie(idToken, { expiresIn });
  
  return sessionCookie;
}

// Helper function to revoke session cookies
export async function revokeRefreshTokens(uid: string): Promise<void> {
  // Get Firebase services
  const { auth } = await getFirebaseAdmin();
  if (!auth) {
    throw new Error('Authentication service not available');
  }
  
  await auth.revokeRefreshTokens(uid);
}