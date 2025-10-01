import { NextRequest, NextResponse } from 'next/server';
import { auth } from './firebaseAdmin';
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
    [key: string]: any;
  };
}

// Extend the NextRequest type to include our user property
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NEXT_PUBLIC_FIREBASE_PROJECT_ID: string;
      FIREBASE_PRIVATE_KEY: string;
      FIREBASE_CLIENT_EMAIL: string;
    }
  }
}

// Middleware function to authenticate users
export async function authenticateUser(request: NextRequest): Promise<{
  success: boolean;
  user?: AuthenticatedUser;
  error?: string;
}> {
  try {
    // Get the session cookie from request headers
    const sessionCookie = request.cookies.get('session')?.value;
    
    if (!sessionCookie) {
      return { 
        success: false, 
        error: 'No session cookie found' 
      };
    }

    // Verify the session cookie
    const decodedClaims = await auth.verifySessionCookie(sessionCookie, true /** checkRevoked */);
    
    // Get user role from custom claims
    const role = decodedClaims.role as UserRole || 'member';
    
    return {
      success: true,
      user: {
        uid: decodedClaims.uid,
        email: decodedClaims.email,
        role: role,
        customClaims: decodedClaims
      }
    };
  } catch (error: any) {
    console.error('Authentication error:', error);
    return { 
      success: false, 
      error: error.message || 'Authentication failed' 
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
  const decodedIdToken = await auth.verifyIdToken(idToken);
  
  // Create session cookie
  const sessionCookie = await auth.createSessionCookie(idToken, { expiresIn });
  
  return sessionCookie;
}

// Helper function to revoke session cookies
export async function revokeRefreshTokens(uid: string): Promise<void> {
  await auth.revokeRefreshTokens(uid);
}