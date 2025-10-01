import { db } from '@/lib/firebaseAdmin';
import { createWelfareSupportSchema, updateWelfareSupportStatusSchema } from '@/lib/schemas';
import { AuthenticatedUser } from '@/lib/authMiddleware';

// Submit welfare support request
export async function submitWelfareSupportRequest(data: any, currentUser: AuthenticatedUser): Promise<{ success: boolean; message?: string; error?: string; welfareSupportRequest?: any }> {
  try {
    // Validate input
    const validatedData = createWelfareSupportSchema.parse(data);
    
    // Only authenticated users can submit welfare support requests
    if (!currentUser) {
      return { success: false, error: 'Authentication required' };
    }
    
    // Create welfare support request in Firestore
    const welfareSupportRequestData = {
      ...validatedData,
      userId: currentUser.uid,
      userEmail: currentUser.email || '',
      userFullName: currentUser.customClaims?.name || '',
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    const welfareSupportRequestRef = await db.collection('welfareSupport').add(welfareSupportRequestData);
    
    return {
      success: true,
      message: 'Welfare support request submitted successfully',
      welfareSupportRequest: {
        id: welfareSupportRequestRef.id,
        ...welfareSupportRequestData
      }
    };
  } catch (error: any) {
    console.error('Submit welfare support request error:', error);
    return { success: false, error: error.message || 'Failed to submit welfare support request' };
  }
}

// List welfare support requests
export async function listWelfareSupportRequests(filters: any, currentUser: AuthenticatedUser): Promise<{ success: boolean; message?: string; error?: string; welfareSupportRequests?: any[]; total?: number }> {
  try {
    // Only authenticated users can list welfare support requests
    if (!currentUser) {
      return { success: false, error: 'Authentication required' };
    }
    
    // Build query based on filters
    let query: any = db.collection('welfareSupport');
    
    // Filter by status
    if (filters.status) {
      query = query.where('status', '==', filters.status);
    }
    
    // Filter by user (if not admin, only show own requests)
    if (!['admin', 'super-admin', 'chaplain'].includes(currentUser.role)) {
      query = query.where('userId', '==', currentUser.uid);
    }
    
    // Order by creation date
    query = query.orderBy('createdAt', 'desc');
    
    // Apply pagination
    const page = filters.page || 1;
    const limit = filters.limit || 10;
    const offset = (page - 1) * limit;
    
    query = query.limit(limit).offset(offset);
    
    // Get welfare support requests
    const welfareSupportRequestsSnapshot = await query.get();
    
    const welfareSupportRequests = welfareSupportRequestsSnapshot.docs.map((doc: any) => ({
      id: doc.id,
      ...doc.data()
    }));
    
    // Get total count
    const totalSnapshot = await db.collection('welfareSupport').get();
    const total = totalSnapshot.size;
    
    return {
      success: true,
      welfareSupportRequests,
      total
    };
  } catch (error: any) {
    console.error('List welfare support requests error:', error);
    return { success: false, error: error.message || 'Failed to list welfare support requests' };
  }
}

// Update welfare support request status
export async function updateWelfareSupportRequestStatus(requestId: string, data: any, currentUser: AuthenticatedUser): Promise<{ success: boolean; message?: string; error?: string }> {
  try {
    // Validate input
    const validatedData = updateWelfareSupportStatusSchema.parse(data);
    
    // Only authenticated users can update welfare support requests
    if (!currentUser) {
      return { success: false, error: 'Authentication required' };
    }
    
    // Get welfare support request from Firestore
    const welfareSupportRequestDoc = await db.collection('welfareSupport').doc(requestId).get();
    
    if (!welfareSupportRequestDoc.exists) {
      return { success: false, error: 'Welfare support request not found' };
    }
    
    const welfareSupportRequestData = welfareSupportRequestDoc.data();
    
    // Check permissions - users can only update their own requests or admins can update any
    if (welfareSupportRequestData?.userId !== currentUser.uid && !['admin', 'super-admin', 'chaplain'].includes(currentUser.role)) {
      return { success: false, error: 'Insufficient permissions' };
    }
    
    // Update welfare support request status
    await db.collection('welfareSupport').doc(requestId).update({
      status: validatedData.status,
      notes: validatedData.notes,
      updatedAt: new Date().toISOString()
    });
    
    return {
      success: true,
      message: 'Welfare support request status updated successfully'
    };
  } catch (error: any) {
    console.error('Update welfare support request status error:', error);
    return { success: false, error: error.message || 'Failed to update welfare support request status' };
  }
}

// Delete welfare support request
export async function deleteWelfareSupportRequest(requestId: string, currentUser: AuthenticatedUser): Promise<{ success: boolean; message?: string; error?: string }> {
  try {
    // Only authenticated users can delete welfare support requests
    if (!currentUser) {
      return { success: false, error: 'Authentication required' };
    }
    
    // Get welfare support request from Firestore
    const welfareSupportRequestDoc = await db.collection('welfareSupport').doc(requestId).get();
    
    if (!welfareSupportRequestDoc.exists) {
      return { success: false, error: 'Welfare support request not found' };
    }
    
    const welfareSupportRequestData = welfareSupportRequestDoc.data();
    
    // Check permissions - users can only delete their own requests or admins can delete any
    if (welfareSupportRequestData?.userId !== currentUser.uid && !['admin', 'super-admin', 'chaplain'].includes(currentUser.role)) {
      return { success: false, error: 'Insufficient permissions' };
    }
    
    // Delete welfare support request
    await db.collection('welfareSupport').doc(requestId).delete();
    
    return {
      success: true,
      message: 'Welfare support request deleted successfully'
    };
  } catch (error: any) {
    console.error('Delete welfare support request error:', error);
    return { success: false, error: error.message || 'Failed to delete welfare support request' };
  }
}