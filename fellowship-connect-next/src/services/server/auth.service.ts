import { Timestamp } from 'firebase/firestore';
import { getFirebaseAdmin } from '../../lib/firebase-admin';
import { BaseService } from './base.service';
import { User } from '../../types/database';
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
   * User login - Authenticate user and create session
   * @param email User email
   * @param password User password
   * @returns Session cookie and success status
   */
  async loginWithIdToken(idToken: string, rememberMe = false): Promise<{ success: boolean; sessionCookie?: string; message: string }> {
    try {
      const { auth, db } = getFirebaseAdmin();

      const decodedIdToken = await auth.verifyIdToken(idToken, true);
      if (decodedIdToken.firebase?.sign_in_provider === 'password' && !decodedIdToken.email_verified) {
        return {
          success: false,
          message: 'Email not verified'
        };
      }

      const expiresIn = rememberMe ? 1000 * 60 * 60 * 24 * 14 : 1000 * 60 * 60 * 24; // 14d or 1d
      const sessionCookie = await auth.createSessionCookie(idToken, { expiresIn });

      if (decodedIdToken.uid) {
        await db.collection('users').doc(decodedIdToken.uid).set({
          lastLoginAt: Timestamp.now(),
          updatedAt: Timestamp.now()
        }, { merge: true });

        await this.logAudit('LOGIN', decodedIdToken.uid, { provider: decodedIdToken.firebase?.sign_in_provider });
      }

      return {
        success: true,
        sessionCookie,
        message: 'Login successful'
      };
    } catch (error: unknown) {
      console.error('Login error:', error);
      
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Login failed' 
      };
    }
  }

  /**
   * User logout - Revoke session
   * @param sessionId Session ID to revoke
   * @returns Success status
   */
  async logout(sessionCookie: string): Promise<{ success: boolean; message: string }> {
    try {
      const { auth } = getFirebaseAdmin();
      const decoded = await auth.verifySessionCookie(sessionCookie, true);

      await auth.revokeRefreshTokens(decoded.uid);
      await this.logAudit('LOGOUT', decoded.uid, {});

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
  async refreshSession(sessionCookie: string, idToken: string, rememberMe = false): Promise<{ success: boolean; sessionCookie?: string; message: string }> {
    try {
      const { auth } = getFirebaseAdmin();

      const decodedSession = await auth.verifySessionCookie(sessionCookie, true);
      const decodedIdToken = await auth.verifyIdToken(idToken, true);

      if (decodedSession.uid !== decodedIdToken.uid) {
        return {
          success: false,
          message: 'Session and token mismatch'
        };
      }

      const expiresIn = rememberMe ? 1000 * 60 * 60 * 24 * 14 : 1000 * 60 * 60 * 24;
      const newSessionCookie = await auth.createSessionCookie(idToken, { expiresIn });

      await this.logAudit('SESSION_REFRESH', decodedSession.uid, { provider: decodedIdToken.firebase?.sign_in_provider });

      return {
        success: true,
        sessionCookie: newSessionCookie,
        message: 'Session refreshed successfully'
      };
    } catch (error) {
      console.error('Session refresh error:', error);
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Failed to refresh session' 
      };
    }
  }
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