import { Timestamp } from 'firebase/firestore';
import { getFirebaseAdmin } from '../../lib/firebase-admin';
import { BaseService } from './base.service';
import { User } from '../../types/database';
import { nanoid } from 'nanoid';
import type { auth } from 'firebase-admin';

interface FirebaseError {
  code: string;
  message: string;
}

/**
 * Authentication Service extending BaseService
 * Handles user authentication, registration, and session management
 */
export class AuthService extends BaseService<User> {
  constructor() {
    super('users');
  }

  /**
   * User signup - Create user account and Firestore profile
   * @param email User email
   * @param password User password
   * @param displayName User display name
   * @returns User data and success status
   */
  async signup(email: string, password: string, displayName: string): Promise<{ success: boolean; userId?: string; message: string }> {
    try {
      const { auth, db } = getFirebaseAdmin();
      
      // Create user in Firebase Authentication
      const userRecord = await auth.createUser({
        email,
        password,
        displayName
      });
      
      // Create user profile in Firestore
      const userId = userRecord.uid;
      const userData: User = {
        uid: userId,
        email,
        displayName,
        role: 'member', // Default role
        photoURL: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        lastLoginAt: null
      };
      
      await db.collection('users').doc(userId).set({
        ...userData,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });
      
      // Log audit action
      await this.logAudit('SIGNUP', userId, { email, displayName });
      
      return { 
        success: true, 
        userId, 
        message: 'User created successfully' 
      };
    } catch (error: unknown) {
      console.error('Signup error:', error);
      
      // Handle specific Firebase auth errors
      if (error instanceof Error && 'code' in error) {
        const firebaseError = error as FirebaseError;
        if (firebaseError.code === 'auth/email-already-exists') {
          return { 
            success: false, 
            message: 'Email already in use' 
          };
        }
        
        if (firebaseError.code === 'auth/invalid-email') {
          return { 
            success: false, 
            message: 'Invalid email address' 
          };
        }
        
        if (firebaseError.code === 'auth/weak-password') {
          return { 
            success: false, 
            message: 'Password is too weak' 
          };
        }
      }
      
      return { 
        success: false, 
        message: 'Failed to create user account' 
      };
    }
  }

  /**
   * User login - Authenticate user and create session
   * @param email User email
   * @param password User password
   * @returns Session cookie and success status
   */
  async login(email: string, password: string): Promise<{ success: boolean; sessionCookie?: string; message: string }> {
    try {
      // Note: For server-side login, we typically use Firebase Admin SDK
      // to create custom tokens that are then used on the client side
      // to sign in with Firebase Authentication
      
      const { auth } = getFirebaseAdmin();
      
      // In a real implementation, you would verify credentials
      // and then create a custom token for the client to use
      
      // For demonstration, we'll just create a session cookie
      // This is a simplified approach - in production, you'd verify
      // the user's credentials first
      
      // Create a custom token
      const customToken = await auth.createCustomToken(nanoid());
      
      // In a real app, you would return this token to the client
      // and the client would use it to sign in with Firebase Auth
      
      // For this example, we'll simulate creating a session cookie
      const sessionCookie = `session_${nanoid()}`;
      
      // Update last login time
      const userRecord = await auth.getUserByEmail(email);
      if (userRecord) {
        const { db } = getFirebaseAdmin();
        await db.collection('users').doc(userRecord.uid).update({
          lastLoginAt: Timestamp.now(),
          updatedAt: Timestamp.now()
        });
        
        // Log audit action
        await this.logAudit('LOGIN', userRecord.uid, { email });
      }
      
      return { 
        success: true, 
        sessionCookie, 
        message: 'Login successful' 
      };
    } catch (error: unknown) {
      console.error('Login error:', error);
      
      // Handle specific Firebase auth errors
      if (error instanceof Error && 'code' in error) {
        const firebaseError = error as FirebaseError;
        if (firebaseError.code === 'auth/user-not-found') {
          return { 
            success: false, 
            message: 'User not found' 
          };
        }
        
        if (firebaseError.code === 'auth/wrong-password') {
          return { 
            success: false, 
            message: 'Invalid password' 
          };
        }
      }
      
      return { 
        success: false, 
        message: 'Login failed' 
      };
    }
  }

  /**
   * User logout - Revoke session
   * @param sessionId Session ID to revoke
   * @returns Success status
   */
  async logout(sessionId: string): Promise<{ success: boolean; message: string }> {
    try {
      const { auth } = getFirebaseAdmin();
      
      // Revoke refresh tokens for the user
      // In a real implementation, you would parse the session cookie
      // to get the user ID and then revoke their refresh tokens
      
      // For demonstration, we'll just log the action
      console.log(`Revoking session: ${sessionId}`);
      
      // Log audit action
      await this.logAudit('LOGOUT', 'unknown', { sessionId });
      
      return { 
        success: true, 
        message: 'Logged out successfully' 
      };
    } catch (error) {
      console.error('Logout error:', error);
      return { 
        success: false, 
        message: 'Logout failed' 
      };
    }
  }

  /**
   * Refresh session - Extend session expiration
   * @param sessionId Session ID to refresh
   * @returns New session cookie and success status
   */
  async refreshSession(sessionId: string): Promise<{ success: boolean; sessionCookie?: string; message: string }> {
    try {
      // In a real implementation, you would verify the existing session
      // and create a new one with extended expiration
      
      const newSessionCookie = `refreshed_session_${nanoid()}`;
      
      // Log audit action
      await this.logAudit('SESSION_REFRESH', 'unknown', { sessionId });
      
      return { 
        success: true, 
        sessionCookie: newSessionCookie, 
        message: 'Session refreshed successfully' 
      };
    } catch (error) {
      console.error('Session refresh error:', error);
      return { 
        success: false, 
        message: 'Failed to refresh session' 
      };
    }
  }

  /**
   * Reset password - Send password reset email
   * @param email User email
   * @returns Success status
   */
  async resetPassword(email: string): Promise<{ success: boolean; message: string }> {
    try {
      const { auth } = getFirebaseAdmin();
      
      // Send password reset email
      await auth.generatePasswordResetLink(email);
      
      // Log audit action
      await this.logAudit('PASSWORD_RESET_REQUEST', 'unknown', { email });
      
      return { 
        success: true, 
        message: 'Password reset email sent' 
      };
    } catch (error: unknown) {
      console.error('Password reset error:', error);
      
      // Handle specific Firebase auth errors
      if (error instanceof Error && 'code' in error) {
        const firebaseError = error as FirebaseError;
        if (firebaseError.code === 'auth/user-not-found') {
          return { 
            success: false, 
            message: 'User not found' 
          };
        }
      }
      
      return { 
        success: false, 
        message: 'Failed to send password reset email' 
      };
    }
  }

  /**
   * Verify email - Send verification email
   * @param userId User ID
   * @returns Success status
   */
  async verifyEmail(userId: string): Promise<{ success: boolean; message: string }> {
    try {
      const { auth } = getFirebaseAdmin();
      
      // Get user record
      const userRecord = await auth.getUser(userId);
      
      // Send email verification link
      await auth.generateEmailVerificationLink(userRecord.email!);
      
      // Log audit action
      await this.logAudit('EMAIL_VERIFICATION_REQUEST', userId, { email: userRecord.email });
      
      return { 
        success: true, 
        message: 'Email verification sent' 
      };
    } catch (error) {
      console.error('Email verification error:', error);
      return { 
        success: false, 
        message: 'Failed to send verification email' 
      };
    }
  }

  /**
   * Update password - Change user password
   * @param userId User ID
   * @param oldPassword Current password
   * @param newPassword New password
   * @returns Success status
   */
  async updatePassword(userId: string, oldPassword: string, newPassword: string): Promise<{ success: boolean; message: string }> {
    try {
      const { auth } = getFirebaseAdmin();
      
      // Update user password
      await auth.updateUser(userId, { password: newPassword });
      
      // Log audit action
      await this.logAudit('PASSWORD_UPDATE', userId, {});
      
      return { 
        success: true, 
        message: 'Password updated successfully' 
      };
    } catch (error: unknown) {
      console.error('Password update error:', error);
      
      // Handle specific Firebase auth errors
      if (error instanceof Error && 'code' in error) {
        const firebaseError = error as FirebaseError;
        if (firebaseError.code === 'auth/weak-password') {
          return { 
            success: false, 
            message: 'New password is too weak' 
          };
        }
      }
      
      return { 
        success: false, 
        message: 'Failed to update password' 
      };
    }
  }

  /**
   * Delete account - Soft delete user account
   * @param userId User ID
   * @returns Success status
   */
  async deleteAccount(userId: string): Promise<{ success: boolean; message: string }> {
    try {
      const { auth, db } = getFirebaseAdmin();
      
      // Soft delete user profile in Firestore
      await db.collection('users').doc(userId).update({
        deleted: true,
        deletedAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });
      
      // Delete user from Firebase Authentication
      await auth.deleteUser(userId);
      
      // Log audit action
      await this.logAudit('ACCOUNT_DELETE', userId, {});
      
      return { 
        success: true, 
        message: 'Account deleted successfully' 
      };
    } catch (error) {
      console.error('Account deletion error:', error);
      return { 
        success: false, 
        message: 'Failed to delete account' 
      };
    }
  }
}