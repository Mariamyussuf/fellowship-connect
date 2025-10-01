import { getIronSession } from 'iron-session';
import { NextApiRequest, NextApiResponse } from 'next';
import { User } from '../types/database';

/**
 * Session management using iron-session
 * Provides secure session handling with cookie-based storage
 */

// Session data interface
export interface SessionData {
  userId: string;
  role: string;
  expiresAt: number;
  userAgent?: string;
  ipAddress?: string;
}

// Session configuration with secure defaults
export const sessionOptions = {
  password: process.env.IRON_SESSION_SECRET || 'complex_password_at_least_32_characters_long',
  cookieName: 'fellowship_connect_session',
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
    httpOnly: true, // Prevent client-side JavaScript access
    sameSite: 'lax', // CSRF protection
    maxAge: 60 * 60 * 24 * 7, // 1 week
    path: '/',
  },
};

/**
 * Create a new session
 * @param req Next.js API request
 * @param res Next.js API response
 * @param user User data to store in session
 * @returns Session object
 */
export async function createSession(
  req: NextApiRequest,
  res: NextApiResponse,
  user: { id: string; role: string }
) {
  const session = await getIronSession<SessionData>(req, res, sessionOptions);
  
  session.userId = user.id;
  session.role = user.role;
  session.expiresAt = Date.now() + sessionOptions.cookieOptions.maxAge! * 1000;
  
  // Store client information for security
  session.userAgent = req.headers['user-agent'];
  session.ipAddress = req.headers['x-forwarded-for'] as string || req.socket.remoteAddress;
  
  await session.save();
  
  return session;
}

/**
 * Get current session
 * @param req Next.js API request
 * @param res Next.js API response
 * @returns Session object or null if no valid session
 */
export async function getSession(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const session = await getIronSession<SessionData>(req, res, sessionOptions);
    
    // Check if session is expired
    if (session.expiresAt && session.expiresAt < Date.now()) {
      await deleteSession(req, res);
      return null;
    }
    
    // Validate session integrity
    if (!session.userId) {
      return null;
    }
    
    return session;
  } catch (error) {
    console.error('Error getting session:', error);
    return null;
  }
}

/**
 * Delete current session (logout)
 * @param req Next.js API request
 * @param res Next.js API response
 */
export async function deleteSession(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  try {
    const session = await getIronSession<SessionData>(req, res, sessionOptions);
    session.destroy();
  } catch (error) {
    console.error('Error deleting session:', error);
  }
}

/**
 * Refresh session expiration
 * @param req Next.js API request
 * @param res Next.js API response
 */
export async function refreshSession(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  try {
    const session = await getIronSession<SessionData>(req, res, sessionOptions);
    session.expiresAt = Date.now() + sessionOptions.cookieOptions.maxAge! * 1000;
    await session.save();
  } catch (error) {
    console.error('Error refreshing session:', error);
  }
}

/**
 * Validate session security
 * @param req Next.js API request
 * @param session Current session
 * @returns Boolean indicating if session is valid
 */
export function validateSessionSecurity(
  req: NextApiRequest,
  session: any
): boolean {
  // Check user agent consistency
  if (session.userAgent && req.headers['user-agent'] !== session.userAgent) {
    console.warn('User agent mismatch detected');
    return false;
  }
  
  return true;
}