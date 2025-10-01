import { NextApiRequest, NextApiResponse } from 'next';
import { getFirebaseAdmin } from '../lib/firebase-admin';
import { getSession } from '../lib/session';

/**
 * Authentication middleware for Next.js API routes
 * Verifies Firebase session cookies and attaches user data to request context
 */

export interface AuthenticatedRequest extends NextApiRequest {
  user?: {
    id: string;
    email?: string;
    role?: string;
  };
}

/**
 * Middleware that requires authentication
 * @param handler Next.js API route handler
 * @returns Wrapped handler with authentication
 */
export function withAuth(handler: (req: AuthenticatedRequest, res: NextApiResponse) => Promise<void>) {
  return async (req: AuthenticatedRequest, res: NextApiResponse) => {
    try {
      // First check for session cookie
      const sessionCookie = req.cookies.session;
      
      if (!sessionCookie) {
        return res.status(401).json({ 
          error: { 
            code: 'UNAUTHORIZED', 
            message: 'Authentication required' 
          } 
        });
      }
      
      // Get Firebase Admin SDK
      const { auth } = getFirebaseAdmin();
      
      // Verify Firebase session cookie
      const decodedClaims = await auth.verifySessionCookie(sessionCookie, true /** checkRevoked */);
      
      // Get user role from Firestore
      let userRole = 'member';
      try {
        const { db } = getFirebaseAdmin();
        const userDoc = await db.collection('users').doc(decodedClaims.uid).get();
        if (userDoc.exists) {
          const userData = userDoc.data();
          userRole = userData?.role || 'member';
        }
      } catch (error) {
        console.warn('Could not fetch user role, defaulting to member:', error);
      }
      
      // Attach user data to request
      req.user = {
        id: decodedClaims.uid,
        email: decodedClaims.email,
        role: userRole
      };
      
      // Call the actual handler
      return handler(req, res);
    } catch (error: any) {
      console.error('Authentication error:', error);
      
      // Handle specific Firebase auth errors
      if (error.code === 'auth/id-token-expired') {
        return res.status(401).json({ 
          error: { 
            code: 'SESSION_EXPIRED', 
            message: 'Session expired' 
          } 
        });
      }
      
      if (error.code === 'auth/id-token-revoked') {
        return res.status(401).json({ 
          error: { 
            code: 'SESSION_REVOKED', 
            message: 'Session revoked' 
          } 
        });
      }
      
      return res.status(401).json({ 
        error: { 
          code: 'INVALID_AUTH', 
          message: 'Invalid authentication' 
        } 
      });
    }
  };
}

/**
 * Middleware that allows optional authentication
 * @param handler Next.js API route handler
 * @returns Wrapped handler with optional authentication
 */
export function withOptionalAuth(handler: (req: AuthenticatedRequest, res: NextApiResponse) => Promise<void>) {
  return async (req: AuthenticatedRequest, res: NextApiResponse) => {
    try {
      // Check for session cookie
      const sessionCookie = req.cookies.session;
      
      if (sessionCookie) {
        // Get Firebase Admin SDK
        const { auth } = getFirebaseAdmin();
        
        // Verify Firebase session cookie
        const decodedClaims = await auth.verifySessionCookie(sessionCookie, true /** checkRevoked */);
        
        // Get user role from Firestore
        let userRole = 'member';
        try {
          const { db } = getFirebaseAdmin();
          const userDoc = await db.collection('users').doc(decodedClaims.uid).get();
          if (userDoc.exists) {
            const userData = userDoc.data();
            userRole = userData?.role || 'member';
          }
        } catch (error) {
          console.warn('Could not fetch user role, defaulting to member:', error);
        }
        
        // Attach user data to request
        req.user = {
          id: decodedClaims.uid,
          email: decodedClaims.email,
          role: userRole
        };
      }
      
      // Call the actual handler
      return handler(req, res);
    } catch (error) {
      console.error('Optional authentication error:', error);
      // Continue without user data if authentication fails
      return handler(req, res);
    }
  };
}

/**
 * Rate limiting for failed authentication attempts
 * @param req Next.js API request
 * @param res Next.js API response
 * @returns Boolean indicating if request should be allowed
 */
export async function checkRateLimit(req: NextApiRequest, res: NextApiResponse): Promise<boolean> {
  // In a real implementation, you would use Redis or similar
  // For now, we'll just return true to allow the request
  return true;
}