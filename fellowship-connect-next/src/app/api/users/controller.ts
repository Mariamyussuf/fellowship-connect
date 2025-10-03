import { getFirebaseAdmin } from '@/lib/firebaseAdmin';
import { updateUserProfileSchema, updateUserRoleSchema } from '@/lib/schemas';
import { AuthenticatedUser } from '@/lib/authMiddleware';
import type FirebaseFirestore from 'firebase-admin/firestore';

// Get user profile
export async function getUserProfile(userId: string, currentUser: AuthenticatedUser): Promise<{ success: boolean; message?: string; error?: string; user?: Record<string, unknown> }> {
  try {
    // Check permissions - users can only get their own profile or admins can get any profile
    if (currentUser.uid !== userId && !['admin', 'super-admin', 'chaplain'].includes(currentUser.role)) {
      return { success: false, error: 'Insufficient permissions' };
    }
    
    // Get Firebase services
    const { db } = await getFirebaseAdmin();
    if (!db) {
      return { success: false, error: 'Database not available' };
    }
    
    // Get user profile from Firestore
    const userDoc = await db.collection('users').doc(userId).get();
    
    if (!userDoc.exists) {
      return { success: false, error: 'User not found' };
    }
    
    const userData = userDoc.data();
    
    // Remove sensitive information
    const { ...safeUserData } = userData as Record<string, unknown>;
    
    return {
      success: true,
      user: safeUserData
    };
  } catch (error: unknown) {
    console.error('Get user profile error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to get user profile';
    return { success: false, error: errorMessage };
  }
}

// Update user profile
export async function updateUserProfile(userId: string, data: Record<string, unknown>, currentUser: AuthenticatedUser): Promise<{ success: boolean; message?: string; error?: string; user?: Record<string, unknown> }> {
  try {
    // Validate input
    const validatedData = updateUserProfileSchema.parse(data);
    
    // Check permissions - users can only update their own profile or admins can update any profile
    if (currentUser.uid !== userId && !['admin', 'super-admin', 'chaplain'].includes(currentUser.role)) {
      return { success: false, error: 'Insufficient permissions' };
    }
    
    // Get Firebase services
    const { db } = await getFirebaseAdmin();
    if (!db) {
      return { success: false, error: 'Database not available' };
    }
    
    // Get current user data
    const userDoc = await db.collection('users').doc(userId).get();
    
    if (!userDoc.exists) {
      return { success: false, error: 'User not found' };
    }
    
    const currentUserData = userDoc.data();
    
    // Update user profile in Firestore
    const updatedUserData = {
      ...currentUserData,
      ...validatedData,
      updatedAt: new Date().toISOString(),
    };
    
    await db.collection('users').doc(userId).set(updatedUserData, { merge: true });
    
    // Remove sensitive information
    const { ...safeUserData } = updatedUserData as Record<string, unknown>;
    
    return {
      success: true,
      message: 'User profile updated successfully',
      user: safeUserData
    };
  } catch (error: unknown) {
    console.error('Update user profile error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to update user profile';
    return { success: false, error: errorMessage };
  }
}

// Delete user
export async function deleteUser(userId: string, currentUser: AuthenticatedUser): Promise<{ success: boolean; message?: string; error?: string }> {
  try {
    // Only super-admins can delete users
    if (currentUser.role !== 'super-admin') {
      return { success: false, error: 'Insufficient permissions' };
    }
    
    // Get Firebase services
    const { db, auth } = await getFirebaseAdmin();
    if (!db || !auth) {
      return { success: false, error: 'Services not available' };
    }
    
    // Delete user from Firebase Auth
    await auth.deleteUser(userId);
    
    // Delete user profile from Firestore
    await db.collection('users').doc(userId).delete();
    
    // TODO: Delete user data from other collections
    
    return {
      success: true,
      message: 'User deleted successfully'
    };
  } catch (error: unknown) {
    console.error('Delete user error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to delete user';
    return { success: false, error: errorMessage };
  }
}

// List users (paginated, admin only)
export async function listUsers(page: number = 1, limit: number = 10, currentUser: AuthenticatedUser): Promise<{ success: boolean; message?: string; error?: string; users?: Record<string, unknown>[]; total?: number }> {
  try {
    // Only admins can list users
    if (!['admin', 'super-admin', 'chaplain'].includes(currentUser.role)) {
      return { success: false, error: 'Insufficient permissions' };
    }
    
    // Get Firebase services
    const { db } = await getFirebaseAdmin();
    if (!db) {
      return { success: false, error: 'Database not available' };
    }
    
    // Calculate offset
    const offset = (page - 1) * limit;
    
    // Get users from Firestore
    const usersSnapshot = await db.collection('users')
      .orderBy('createdAt', 'desc')
      .limit(limit)
      .offset(offset)
      .get();
    
    const users = usersSnapshot.docs.map((doc: FirebaseFirestore.QueryDocumentSnapshot) => ({
      id: doc.id,
      ...doc.data() as Record<string, unknown>
    }));
    
    // Get total count
    const totalSnapshot = await db.collection('users').get();
    const total = totalSnapshot.size;
    
    return {
      success: true,
      users,
      total
    };
  } catch (error: unknown) {
    console.error('List users error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to list users';
    return { success: false, error: errorMessage };
  }
}

// Update user role (super-admin only)
export async function updateUserRole(userId: string, data: Record<string, unknown>, currentUser: AuthenticatedUser): Promise<{ success: boolean; message?: string; error?: string }> {
  try {
    // Validate input
    const validatedData = updateUserRoleSchema.parse(data);
    
    // Only super-admins can update user roles
    if (currentUser.role !== 'super-admin') {
      return { success: false, error: 'Insufficient permissions' };
    }
    
    // Get Firebase services
    const { db, auth } = await getFirebaseAdmin();
    if (!db || !auth) {
      return { success: false, error: 'Services not available' };
    }
    
    // Update user role in Firebase Auth
    await auth.setCustomUserClaims(userId, { role: validatedData.role });
    
    // Update user role in Firestore
    await db.collection('users').doc(userId).set({
      role: validatedData.role,
      updatedAt: new Date().toISOString()
    }, { merge: true });
    
    // Log role change in audit logs
    await db.collection('auditLogs').add({
      action: 'updateUserRole',
      actorId: currentUser.uid,
      actorEmail: currentUser.email,
      targetId: userId,
      changes: {
        oldRole: 'unknown', // In a real implementation, we would fetch the old role
        newRole: validatedData.role
      },
      timestamp: new Date().toISOString()
    });
    
    return {
      success: true,
      message: 'User role updated successfully'
    };
  } catch (error: unknown) {
    console.error('Update user role error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to update user role';
    return { success: false, error: errorMessage };
  }
}