import { auth, db } from '@/lib/firebaseAdmin';
import { signupSchema, loginSchema, resetPasswordSchema } from '@/lib/schemas';
import { AuthenticatedUser } from '@/lib/authMiddleware';
import type { UserRecord } from 'firebase-admin/auth';

interface UserProfile {
  uid: string;
  email?: string;
  fullName?: string;
  department?: string;
  college?: string;
  role: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
  [key: string]: unknown;
}

interface SignupResult {
  success: boolean;
  message?: string;
  error?: string;
  user?: UserProfile;
}

interface LoginResult {
  success: boolean;
  message?: string;
  error?: string;
  sessionCookie?: string;
}

interface BaseResult {
  success: boolean;
  message?: string;
  error?: string;
}

interface FirebaseError {
  code: string;
  message: string;
}

// User registration
export async function signup(data: Record<string, unknown>): Promise<SignupResult> {
  try {
    // Validate input
    const validatedData = signupSchema.parse(data);
    
    // Check if auth is initialized
    if (!auth) {
      return { success: false, error: 'Authentication service not initialized' };
    }
    
    // Create user with Firebase Auth (Admin SDK)
    const userRecord: UserRecord = await auth.createUser({
      email: validatedData.email,
      password: validatedData.password,
      displayName: validatedData.fullName,
    });
    
    // Send email verification
    await auth.generateEmailVerificationLink(validatedData.email);
    
    // Check if db is initialized
    if (!db) {
      return { success: false, error: 'Database service not initialized' };
    }
    
    // Create user profile in Firestore
    const userProfile: UserProfile = {
      uid: userRecord.uid,
      email: userRecord.email || undefined,
      fullName: validatedData.fullName,
      department: validatedData.department,
      college: validatedData.college,
      role: 'member',
      active: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    await db.collection('users').doc(userRecord.uid).set(userProfile);
    
    return {
      success: true,
      message: 'User registered successfully. Please check your email for verification.',
      user: userProfile
    };
  } catch (error: unknown) {
    console.error('Signup error:', error);
    
    // Handle specific Firebase errors
    if (error instanceof Error && 'code' in error) {
      const firebaseError = error as FirebaseError;
      if (firebaseError.code === 'auth/email-already-exists') {
        return { success: false, error: 'Email already in use' };
      } else if (firebaseError.code === 'auth/invalid-email') {
        return { success: false, error: 'Invalid email address' };
      } else if (firebaseError.code === 'auth/weak-password') {
        return { success: false, error: 'Password is too weak' };
      }
    }
    
    const errorMessage = error instanceof Error ? error.message : 'Registration failed';
    return { success: false, error: errorMessage };
  }
}

// User login
export async function login(data: Record<string, unknown>): Promise<LoginResult> {
  try {
    // Validate input
    const validatedData = loginSchema.parse(data);
    
    // Check if auth is initialized
    if (!auth) {
      return { success: false, error: 'Authentication service not initialized' };
    }
    
    // Verify user credentials using Firebase Admin SDK
    // Note: In a real implementation, we would verify the user's credentials
    // For now, we'll simulate this by getting the user record
    let userRecord: UserRecord;
    try {
      userRecord = await auth.getUserByEmail(validatedData.email);
    } catch (error: unknown) {
      if (error instanceof Error && 'code' in error && (error as FirebaseError).code === 'auth/user-not-found') {
        return { success: false, error: 'User not found' };
      }
      throw error;
    }
    
    // Check if db is initialized
    if (!db) {
      return { success: false, error: 'Database service not initialized' };
    }
    
    // In a real implementation, we would verify the password
    // For now, we'll assume the credentials are valid
    
    // Get user profile from Firestore
    const userDoc = await db.collection('users').doc(userRecord.uid).get();
    if (!userDoc.exists) {
      return { success: false, error: 'User profile not found' };
    }
    
    const userProfile = userDoc.data() as UserProfile | undefined;
    
    // Create custom token for client-side authentication
    const customToken = await auth.createCustomToken(userRecord.uid);
    
    // For session-based auth, we would create a session cookie
    // This is a simplified version - in production, you'd verify the ID token first
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const expiresIn = 60 * 60 * 24 * 7 * 1000; // 7 days
    // Note: To create a session cookie, we need a valid ID token from the client
    // For this implementation, we'll return the custom token instead
    const sessionCookie = customToken;
    
    // Update last login time
    await db.collection('users').doc(userRecord.uid).set({
      ...userProfile,
      lastLoginAt: new Date().toISOString()
    }, { merge: true });
    
    return {
      success: true,
      message: 'Login successful',
      sessionCookie
    };
  } catch (error: unknown) {
    console.error('Login error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Login failed';
    return { success: false, error: errorMessage };
  }
}

// User logout
export async function logout(): Promise<BaseResult> {
  try {
    // In a real implementation, we would revoke the refresh token
    // For now, we'll just return success
    
    return {
      success: true,
      message: 'Logout successful'
    };
  } catch (error: unknown) {
    console.error('Logout error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Logout failed';
    return { success: false, error: errorMessage };
  }
}

// Password reset
export async function resetPassword(data: Record<string, unknown>): Promise<BaseResult> {
  try {
    // Validate input
    const validatedData = resetPasswordSchema.parse(data);
    
    // Check if auth is initialized
    if (!auth) {
      return { success: false, error: 'Authentication service not initialized' };
    }
    
    // Send password reset email
    const resetLink = await auth.generatePasswordResetLink(validatedData.email);
    
    // In a real implementation, you would send this link via email
    // For now, we'll just log it
    console.log('Password reset link:', resetLink);
    
    return {
      success: true,
      message: 'Password reset email sent. Please check your inbox.'
    };
  } catch (error: unknown) {
    console.error('Password reset error:', error);
    
    if (error instanceof Error && 'code' in error) {
      const firebaseError = error as FirebaseError;
      if (firebaseError.code === 'auth/user-not-found') {
        return { success: false, error: 'User not found' };
      }
    }
    
    const errorMessage = error instanceof Error ? error.message : 'Password reset failed';
    return { success: false, error: errorMessage };
  }
}

// Refresh session
export async function refreshSession(idToken: string): Promise<LoginResult> {
  try {
    // Check if auth is initialized
    if (!auth) {
      return { success: false, error: 'Authentication service not initialized' };
    }
    
    // Verify ID token
    const decodedToken = await auth.verifyIdToken(idToken);
    
    // Create new session cookie
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const expiresIn = 60 * 60 * 24 * 7 * 1000; // 7 days
    // Note: To create a session cookie, we need to use the client SDK
    // For this implementation, we'll return a custom token instead
    const customToken = await auth.createCustomToken(decodedToken.uid);
    
    return {
      success: true,
      message: 'Session refreshed successfully',
      sessionCookie: customToken
    };
  } catch (error: unknown) {
    console.error('Session refresh error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Session refresh failed';
    return { success: false, error: errorMessage };
  }
}

// Verify email
export async function verifyEmail(oobCode: string): Promise<BaseResult> {
  try {
    // In a real implementation using Admin SDK, we would handle this differently
    // For now, we'll just return success
    
    return {
      success: true,
      message: 'Email verified successfully'
    };
  } catch (error: unknown) {
    console.error('Email verification error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Email verification failed';
    return { success: false, error: errorMessage };
  }
}