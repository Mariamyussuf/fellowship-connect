import { NextApiRequest, NextApiResponse } from 'next';
import { getSession, sessionOptions } from '../lib/session';

/**
 * Session middleware for Next.js API routes
 * Validates session and attaches user data to request
 */

export interface AuthenticatedRequest extends NextApiRequest {
  session?: any;
  user?: {
    id: string;
    role: string;
  };
}

/**
 * Session validation middleware
 * @param handler Next.js API route handler
 * @returns Wrapped handler with session validation
 */
export function withSession(handler: (req: AuthenticatedRequest, res: NextApiResponse) => Promise<void>) {
  return async (req: AuthenticatedRequest, res: NextApiResponse) => {
    try {
      // Get session
      const session = await getSession(req, res);
      
      // Check if session exists
      if (!session || !session.userId) {
        return res.status(401).json({ 
          error: { 
            code: 'UNAUTHORIZED', 
            message: 'Authentication required' 
          } 
        });
      }
      
      // Check if session is expired
      if (session.expiresAt && session.expiresAt < Date.now()) {
        return res.status(401).json({ 
          error: { 
            code: 'SESSION_EXPIRED', 
            message: 'Session expired' 
          } 
        });
      }
      
      // Attach session and user data to request
      req.session = session;
      req.user = {
        id: session.userId,
        role: session.role
      };
      
      // Call the actual handler
      return handler(req, res);
    } catch (error) {
      console.error('Session validation error:', error);
      return res.status(500).json({ 
        error: { 
          code: 'INTERNAL_ERROR', 
          message: 'Internal server error' 
        } 
      });
    }
  };
}