import { NextApiRequest, NextApiResponse } from 'next';
import { getFirebaseAdmin } from '../lib/firebase-admin';

export interface AuthenticatedRequest extends NextApiRequest {
  user?: {
    id: string;
    email?: string;
    role?: string;
  };
}

interface FirebaseError {
  code: string;
  message: string;
}

async function buildUser(sessionCookie: string): Promise<AuthenticatedRequest['user']> {
  const { auth, db } = getFirebaseAdmin();
  if (!auth) {
    throw new Error('AUTH_NOT_INITIALIZED');
  }

  const decoded = await auth.verifySessionCookie(sessionCookie, true);

  let role = 'member';
  if (db) {
    try {
      const snap = await db.collection('users').doc(decoded.uid).get();
      if (snap.exists) {
        const data = snap.data();
        role = data?.role || role;
      }
    } catch (error) {
      console.warn('Failed to resolve user role, defaulting to member:', error);
    }
  }

  return {
    id: decoded.uid,
    email: decoded.email,
    role
  };
}

function translateFirebaseError(error: FirebaseError) {
  if (error.code === 'auth/id-token-expired') {
    return {
      status: 401,
      body: {
        error: {
          code: 'SESSION_EXPIRED',
          message: 'Session expired'
        }
      }
    } as const;
  }

  if (error.code === 'auth/id-token-revoked') {
    return {
      status: 401,
      body: {
        error: {
          code: 'SESSION_REVOKED',
          message: 'Session revoked'
        }
      }
    } as const;
  }

  return {
    status: 401,
    body: {
      error: {
        code: 'INVALID_AUTH',
        message: 'Invalid authentication'
      }
    }
  } as const;
}

export function withAuth(handler: (req: AuthenticatedRequest, res: NextApiResponse) => Promise<void>) {
  return async (req: AuthenticatedRequest, res: NextApiResponse) => {
    try {
      const sessionCookie = req.cookies.session;
      if (!sessionCookie) {
        return res.status(401).json({
          error: {
            code: 'UNAUTHORIZED',
            message: 'Authentication required'
          }
        });
      }

      req.user = await buildUser(sessionCookie);
      return handler(req, res);
    } catch (error) {
      console.error('Authentication error:', error);

      if (error instanceof Error) {
        if (error.message === 'AUTH_NOT_INITIALIZED') {
          return res.status(500).json({
            error: {
              code: 'AUTH_NOT_INITIALIZED',
              message: 'Authentication service not available'
            }
          });
        }

        if ('code' in error) {
          const translated = translateFirebaseError(error as FirebaseError);
          return res.status(translated.status).json(translated.body);
        }
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

export function withOptionalAuth(handler: (req: AuthenticatedRequest, res: NextApiResponse) => Promise<void>) {
  return async (req: AuthenticatedRequest, res: NextApiResponse) => {
    try {
      const sessionCookie = req.cookies.session;
      if (sessionCookie) {
        try {
          req.user = await buildUser(sessionCookie);
        } catch (error) {
          console.warn('Optional auth: failed to attach user context:', error);
        }
      }

      return handler(req, res);
    } catch (error) {
      console.error('Optional authentication error:', error);
      return handler(req, res);
    }
  };
}

export function checkRateLimit(): Promise<boolean> {
  return Promise.resolve(true);
}