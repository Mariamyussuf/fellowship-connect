import { NextApiResponse } from 'next';
import { AuthenticatedRequest } from './auth';
import { getFirebaseAdmin } from '../lib/firebase-admin';

/**
 * Role-based access control middleware
 * Checks user roles and permissions for API routes
 */

// Define roles and hierarchy
export type UserRole = 'member' | 'admin' | 'super-admin';

// Role hierarchy: super-admin > admin > member
const roleHierarchy: Record<UserRole, number> = {
  'member': 1,
  'admin': 2,
  'super-admin': 3
};

// Cache for role lookups (in-memory, 5 min TTL)
const roleCache = new Map<string, { role: UserRole; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Get user role from Firestore with caching
 * @param userId User ID
 * @returns User role
 */
async function getUserRole(userId: string): Promise<UserRole> {
  // Check cache first
  const cached = roleCache.get(userId);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.role;
  }
  
  try {
    // Get Firebase Admin SDK
    const { db } = getFirebaseAdmin();
    
    // Fetch user role from Firestore
    const userDoc = await db.collection('users').doc(userId).get();
    
    if (userDoc.exists) {
      const userData = userDoc.data();
      const role = userData?.role || 'member';
      
      // Cache the role
      roleCache.set(userId, { role: role as UserRole, timestamp: Date.now() });
      
      return role as UserRole;
    }
  } catch (error) {
    console.error('Error fetching user role:', error);
  }
  
  // Default to member role
  return 'member';
}

/**
 * Check if user has required role
 * @param userRole User's role
 * @param requiredRoles Roles that are allowed
 * @returns Boolean indicating if user has required role
 */
function hasRequiredRole(userRole: UserRole, requiredRoles: UserRole[]): boolean {
  const userRoleLevel = roleHierarchy[userRole] || 0;
  
  return requiredRoles.some(role => {
    const requiredRoleLevel = roleHierarchy[role] || 0;
    return userRoleLevel >= requiredRoleLevel;
  });
}

/**
 * Middleware to require specific roles
 * @param roles Allowed roles
 * @returns Middleware function
 */
export function requireRole(...roles: UserRole[]) {
  return (req: AuthenticatedRequest, res: NextApiResponse) => {
    // Check if user is authenticated
    if (!req.user) {
      return res.status(401).json({ 
        error: { 
          code: 'UNAUTHORIZED', 
          message: 'Authentication required' 
        } 
      });
    }
    
    // Get user role
    const userRole = req.user.role as UserRole || 'member';
    
    // Check if user has required role
    if (!hasRequiredRole(userRole, roles)) {
      // Log permission denial for audit
      console.warn(`Permission denied: User ${req.user.id} with role ${userRole} attempted to access resource requiring roles: ${roles.join(', ')}`);
      
      return res.status(403).json({ 
        error: { 
          code: 'FORBIDDEN', 
          message: 'Insufficient permissions' 
        } 
      });
    }
    
    // User has required role, continue
    return true;
  };
}

/**
 * Middleware to check resource ownership
 * @param resourceUserId User ID of the resource owner
 * @returns Middleware function
 */
export function requireOwnership(resourceUserId: string) {
  return (req: AuthenticatedRequest, res: NextApiResponse) => {
    // Check if user is authenticated
    if (!req.user) {
      return res.status(401).json({ 
        error: { 
          code: 'UNAUTHORIZED', 
          message: 'Authentication required' 
        } 
      });
    }
    
    // Super-admins can access all resources
    if (req.user.role === 'super-admin') {
      return true;
    }
    
    // Check if user owns the resource
    if (req.user.id !== resourceUserId) {
      return res.status(403).json({ 
        error: { 
          code: 'FORBIDDEN', 
          message: 'Access denied: You do not own this resource' 
        } 
      });
    }
    
    // User owns the resource, continue
    return true;
  };
}

/**
 * Check if user has specific permission
 * @param action Action to check
 * @param resource Resource to check
 * @returns Middleware function
 */
export function hasPermission(action: string, resource: string) {
  return async (req: AuthenticatedRequest, res: NextApiResponse) => {
    // Check if user is authenticated
    if (!req.user) {
      return res.status(401).json({ 
        error: { 
          code: 'UNAUTHORIZED', 
          message: 'Authentication required' 
        } 
      });
    }
    
    try {
      // Get Firebase Admin SDK
      const { db } = getFirebaseAdmin();
      
      // Check permissions in Firestore
      const permissionDoc = await db
        .collection('permissions')
        .doc(`${req.user.role}-${resource}-${action}`)
        .get();
      
      if (!permissionDoc.exists) {
        return res.status(403).json({ 
          error: { 
            code: 'FORBIDDEN', 
            message: 'Insufficient permissions for this action' 
          } 
        });
      }
      
      // Permission granted, continue
      return true;
    } catch (error) {
      console.error('Error checking permissions:', error);
      return res.status(500).json({ 
        error: { 
          code: 'INTERNAL_ERROR', 
          message: 'Error checking permissions' 
        } 
      });
    }
  };
}

/**
 * Clear role cache for a specific user
 * @param userId User ID
 */
export function clearRoleCache(userId: string): void {
  roleCache.delete(userId);
}

/**
 * Clear all role cache
 */
export function clearAllRoleCache(): void {
  roleCache.clear();
}