import { db } from '@/lib/firebaseAdmin';
import { createPrayerRequestSchema, updatePrayerRequestStatusSchema } from '@/lib/schemas';
import { AuthenticatedUser } from '@/lib/authMiddleware';

// Submit prayer request
export async function submitPrayerRequest(data: any, currentUser: AuthenticatedUser): Promise<{ success: boolean; message?: string; error?: string; prayerRequest?: any }> {
  try {
    // Validate input
    const validatedData = createPrayerRequestSchema.parse(data);
    
    // Only authenticated users can submit prayer requests
    if (!currentUser) {
      return { success: false, error: 'Authentication required' };
    }
    
    // Create prayer request in Firestore
    const prayerRequestData = {
      ...validatedData,
      userId: currentUser.uid,
      userEmail: currentUser.email || '',
      userFullName: currentUser.customClaims?.name || '',
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    const prayerRequestRef = await db.collection('prayerRequests').add(prayerRequestData);
    
    return {
      success: true,
      message: 'Prayer request submitted successfully',
      prayerRequest: {
        id: prayerRequestRef.id,
        ...prayerRequestData
      }
    };
  } catch (error: any) {
    console.error('Submit prayer request error:', error);
    return { success: false, error: error.message || 'Failed to submit prayer request' };
  }
}

// List prayer requests
export async function listPrayerRequests(filters: any, currentUser: AuthenticatedUser): Promise<{ success: boolean; message?: string; error?: string; prayerRequests?: any[]; total?: number }> {
  try {
    // Only authenticated users can list prayer requests
    if (!currentUser) {
      return { success: false, error: 'Authentication required' };
    }
    
    // Build query based on filters
    let query: any = db.collection('prayerRequests');
    
    // Filter by status
    if (filters.status) {
      query = query.where('status', '==', filters.status);
    }
    
    // Filter by user (if not admin, only show own requests)
    if (!['admin', 'super-admin', 'chaplain'].includes(currentUser.role)) {
      query = query.where('userId', '==', currentUser.uid);
    }
    
    // Filter by public visibility
    if (!['admin', 'super-admin', 'chaplain'].includes(currentUser.role)) {
      query = query.where('isPublic', '==', true);
    }
    
    // Order by creation date
    query = query.orderBy('createdAt', 'desc');
    
    // Apply pagination
    const page = filters.page || 1;
    const limit = filters.limit || 10;
    const offset = (page - 1) * limit;
    
    query = query.limit(limit).offset(offset);
    
    // Get prayer requests
    const prayerRequestsSnapshot = await query.get();
    
    const prayerRequests = prayerRequestsSnapshot.docs.map((doc: any) => ({
      id: doc.id,
      ...doc.data()
    }));
    
    // Get total count
    const totalSnapshot = await db.collection('prayerRequests').get();
    const total = totalSnapshot.size;
    
    return {
      success: true,
      prayerRequests,
      total
    };
  } catch (error: any) {
    console.error('List prayer requests error:', error);
    return { success: false, error: error.message || 'Failed to list prayer requests' };
  }
}

// Update prayer request status
export async function updatePrayerRequestStatus(requestId: string, data: any, currentUser: AuthenticatedUser): Promise<{ success: boolean; message?: string; error?: string }> {
  try {
    // Validate input
    const validatedData = updatePrayerRequestStatusSchema.parse(data);
    
    // Only authenticated users can update prayer requests
    if (!currentUser) {
      return { success: false, error: 'Authentication required' };
    }
    
    // Get prayer request from Firestore
    const prayerRequestDoc = await db.collection('prayerRequests').doc(requestId).get();
    
    if (!prayerRequestDoc.exists) {
      return { success: false, error: 'Prayer request not found' };
    }
    
    const prayerRequestData = prayerRequestDoc.data();
    
    // Check permissions - users can only update their own requests or admins can update any
    if (prayerRequestData?.userId !== currentUser.uid && !['admin', 'super-admin', 'chaplain'].includes(currentUser.role)) {
      return { success: false, error: 'Insufficient permissions' };
    }
    
    // Update prayer request status
    await db.collection('prayerRequests').doc(requestId).update({
      status: validatedData.status,
      notes: validatedData.notes,
      updatedAt: new Date().toISOString()
    });
    
    return {
      success: true,
      message: 'Prayer request status updated successfully'
    };
  } catch (error: any) {
    console.error('Update prayer request status error:', error);
    return { success: false, error: error.message || 'Failed to update prayer request status' };
  }
}

// Delete prayer request
export async function deletePrayerRequest(requestId: string, currentUser: AuthenticatedUser): Promise<{ success: boolean; message?: string; error?: string }> {
  try {
    // Only authenticated users can delete prayer requests
    if (!currentUser) {
      return { success: false, error: 'Authentication required' };
    }
    
    // Get prayer request from Firestore
    const prayerRequestDoc = await db.collection('prayerRequests').doc(requestId).get();
    
    if (!prayerRequestDoc.exists) {
      return { success: false, error: 'Prayer request not found' };
    }
    
    const prayerRequestData = prayerRequestDoc.data();
    
    // Check permissions - users can only delete their own requests or admins can delete any
    if (prayerRequestData?.userId !== currentUser.uid && !['admin', 'super-admin', 'chaplain'].includes(currentUser.role)) {
      return { success: false, error: 'Insufficient permissions' };
    }
    
    // Delete prayer request
    await db.collection('prayerRequests').doc(requestId).delete();
    
    return {
      success: true,
      message: 'Prayer request deleted successfully'
    };
  } catch (error: any) {
    console.error('Delete prayer request error:', error);
    return { success: false, error: error.message || 'Failed to delete prayer request' };
  }
}