import { Timestamp } from 'firebase/firestore';
import { getFirebaseAdmin } from '../../lib/firebase-admin';
import { BaseService } from './base.service';
import { User } from '../../types/database';
import { DocumentData, QueryDocumentSnapshot } from 'firebase-admin/firestore';

/**
 * User Service extending BaseService
 * Handles user management operations
 */
export class UserService extends BaseService<User> {
  constructor() {
    super('users');
  }

  /**
   * Get user profile
   * @param userId User ID
   * @returns User profile data
   */
  async getUser(userId: string): Promise<{ success: boolean; user?: User; message?: string }> {
    try {
      const { db } = getFirebaseAdmin();
      
      const userDoc = await db.collection('users').doc(userId).get();
      
      if (!userDoc.exists) {
        return { 
          success: false, 
          message: 'User not found' 
        };
      }
      
      const userData: User = { ...(userDoc.data() as User), uid: userDoc.id };
      
      // Log audit action
      await this.logAudit('GET_USER', userId, {});
      
      return { 
        success: true, 
        user: userData 
      };
    } catch (error) {
      console.error('Get user error:', error);
      return { 
        success: false, 
        message: 'Failed to fetch user' 
      };
    }
  }

  /**
   * Update user profile
   * @param userId User ID
   * @param data User data to update
   * @returns Success status
   */
  async updateUser(userId: string, data: Partial<User>): Promise<{ success: boolean; message: string }> {
    try {
      const { db } = getFirebaseAdmin();
      
      await db.collection('users').doc(userId).update({
        ...data,
        updatedAt: Timestamp.now()
      });
      
      // Log audit action
      await this.logAudit('UPDATE_USER', userId, data);
      
      return { 
        success: true, 
        message: 'User updated successfully' 
      };
    } catch (error) {
      console.error('Update user error:', error);
      return { 
        success: false, 
        message: 'Failed to update user' 
      };
    }
  }

  /**
   * Delete user (soft delete)
   * @param userId User ID
   * @returns Success status
   */
  async deleteUser(userId: string): Promise<{ success: boolean; message: string }> {
    try {
      const { db, auth } = getFirebaseAdmin();
      
      // Soft delete user profile in Firestore
      await db.collection('users').doc(userId).update({
        deleted: true,
        deletedAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });
      
      // Delete user from Firebase Authentication
      await auth.deleteUser(userId);
      
      // Log audit action
      await this.logAudit('DELETE_USER', userId, {});
      
      return { 
        success: true, 
        message: 'User deleted successfully' 
      };
    } catch (error) {
      console.error('Delete user error:', error);
      return { 
        success: false, 
        message: 'Failed to delete user' 
      };
    }
  }

  /**
   * List users with filtering and pagination
   * @param filters Filters to apply
   * @param pagination Pagination parameters
   * @returns List of users
   */
  async listUsers(
    filters: { role?: string; status?: string } = {},
    pagination: { limit?: number; lastDoc?: QueryDocumentSnapshot<DocumentData> } = {}
  ): Promise<{ success: boolean; users?: User[]; lastDoc?: QueryDocumentSnapshot<DocumentData>; message?: string }> {
    try {
      const { db } = getFirebaseAdmin();
      
      let query: any = db.collection('users').orderBy('createdAt', 'desc');
      
      // Apply filters
      if (filters.role) {
        query = query.where('role', '==', filters.role);
      }
      
      if (filters.status) {
        query = query.where('status', '==', filters.status);
      }
      
      // Apply pagination
      if (pagination.limit) {
        query = query.limit(pagination.limit);
      }
      
      if (pagination.lastDoc) {
        query = query.startAfter(pagination.lastDoc);
      }
      
      const querySnapshot = await query.get();
      const users: User[] = [];
      
      querySnapshot.forEach((doc: QueryDocumentSnapshot<DocumentData>) => {
        users.push({ ...(doc.data() as User), uid: doc.id });
      });
      
      const lastDoc = querySnapshot.docs[querySnapshot.docs.length - 1];
      
      // Log audit action
      await this.logAudit('LIST_USERS', 'admin', { filters, pagination });
      
      return { 
        success: true, 
        users,
        lastDoc
      };
    } catch (error) {
      console.error('List users error:', error);
      return { 
        success: false, 
        message: 'Failed to list users' 
      };
    }
  }

  /**
   * Update user role (super-admin only)
   * @param userId User ID
   * @param newRole New role
   * @returns Success status
   */
  async updateRole(userId: string, newRole: string): Promise<{ success: boolean; message: string }> {
    try {
      const { db } = getFirebaseAdmin();
      
      await db.collection('users').doc(userId).update({
        role: newRole,
        updatedAt: Timestamp.now()
      });
      
      // Clear role cache
      // TODO: Implement role cache clearing
      
      // Log audit action
      await this.logAudit('UPDATE_USER_ROLE', userId, { newRole });
      
      return { 
        success: true, 
        message: 'User role updated successfully' 
      };
    } catch (error) {
      console.error('Update user role error:', error);
      return { 
        success: false, 
        message: 'Failed to update user role' 
      };
    }
  }

  /**
   * Search users by name or email
   * @param query Search query
   * @returns List of matching users
   */
  async searchUsers(query: string): Promise<{ success: boolean; users?: User[]; message?: string }> {
    try {
      const { db } = getFirebaseAdmin();
      
      // Note: Firestore doesn't support full-text search natively
      // This is a simplified implementation using array-contains-any
      // In production, you would use Algolia or similar
      
      const usersRef = db.collection('users');
      const snapshot = await usersRef.get();
      const users: User[] = [];
      
      snapshot.forEach((doc: QueryDocumentSnapshot<DocumentData>) => {
        const userData: User = { ...(doc.data() as User), uid: doc.id };
        
        // Simple search implementation
        if (
          (userData.displayName && userData.displayName.toLowerCase().includes(query.toLowerCase())) ||
          (userData.email && userData.email.toLowerCase().includes(query.toLowerCase()))
        ) {
          users.push(userData);
        }
      });
      
      // Log audit action
      await this.logAudit('SEARCH_USERS', 'user', { query });
      
      return { 
        success: true, 
        users 
      };
    } catch (error) {
      console.error('Search users error:', error);
      return { 
        success: false, 
        message: 'Failed to search users' 
      };
    }
  }
}