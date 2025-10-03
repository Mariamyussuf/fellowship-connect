import { db } from '@/lib/firebaseAdmin';
import { createWelfareSupportSchema, updateWelfareSupportStatusSchema } from '@/lib/schemas';
import { AuthenticatedUser } from '@/lib/authMiddleware';
import type FirebaseFirestore from 'firebase-admin/firestore';

interface WelfareSupportRequest {
  id?: string;
  title: string;
  description: string;
  category: string;
  urgency: 'low' | 'medium' | 'high';
  userId: string;
  userEmail?: string;
  userFullName?: string;
  status: 'pending' | 'approved' | 'rejected' | 'in-progress' | 'resolved';
  notes?: string;
  createdAt: string;
  updatedAt: string;
  [key: string]: unknown;
}

interface SubmitWelfareSupportRequestResult {
  success: boolean;
  message?: string;
  error?: string;
  welfareSupportRequest?: WelfareSupportRequest;
}

interface ListWelfareSupportRequestsResult {
  success: boolean;
  message?: string;
  error?: string;
  welfareSupportRequests?: WelfareSupportRequest[];
  total?: number;
}

interface BaseResult {
  success: boolean;
  message?: string;
  error?: string;
}

// Submit welfare support request
export async function submitWelfareSupportRequest(data: Record<string, unknown>, currentUser: AuthenticatedUser): Promise<SubmitWelfareSupportRequestResult> {
  try {
    // Validate input
    const validatedData = createWelfareSupportSchema.parse(data);
    
    // Only authenticated users can submit welfare support requests
    if (!currentUser) {
      return { success: false, error: 'Authentication required' };
    }
    
    // Check if db is initialized
    if (!db) {
      return { success: false, error: 'Database not initialized' };
    }
    
    // Create welfare support request in Firestore
    const welfareSupportRequestData: Omit<WelfareSupportRequest, 'id'> = {
      title: validatedData.title,
      description: validatedData.description,
      category: validatedData.category,
      urgency: validatedData.urgency,
      userId: currentUser.uid,
      userEmail: currentUser.email || '',
      userFullName: currentUser.customClaims?.name || '',
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    const welfareSupportRequestRef = await db.collection('welfareSupport').add(welfareSupportRequestData);
    
    const fullWelfareSupportRequest: WelfareSupportRequest = {
      ...welfareSupportRequestData,
      id: welfareSupportRequestRef.id,
      title: '',
      description: '',
      category: '',
      urgency: 'low',
      userId: '',
      status: 'pending',
      createdAt: '',
      updatedAt: ''
    };
    
    return {
      success: true,
      message: 'Welfare support request submitted successfully',
      welfareSupportRequest: fullWelfareSupportRequest
    };
  } catch (error: unknown) {
    console.error('Submit welfare support request error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to submit welfare support request';
    return { success: false, error: errorMessage };
  }
}

// List welfare support requests
export async function listWelfareSupportRequests(filters: Record<string, unknown>, currentUser: AuthenticatedUser): Promise<ListWelfareSupportRequestsResult> {
  try {
    // Only authenticated users can list welfare support requests
    if (!currentUser) {
      return { success: false, error: 'Authentication required' };
    }
    
    // Check if db is initialized
    if (!db) {
      return { success: false, error: 'Database not initialized' };
    }
    
    // Build query based on filters
    let query: FirebaseFirestore.Query = db.collection('welfareSupport');
    
    // Filter by status
    if (filters.status) {
      query = query.where('status', '==', filters.status as string);
    }
    
    // Filter by user (if not admin, only show own requests)
    if (!['admin', 'super-admin', 'chaplain'].includes(currentUser.role)) {
      query = query.where('userId', '==', currentUser.uid);
    }
    
    // Order by creation date
    query = query.orderBy('createdAt', 'desc');
    
    // Apply pagination
    const page = (filters.page as number) || 1;
    const limit = (filters.limit as number) || 10;
    const offset = (page - 1) * limit;
    
    query = query.limit(limit).offset(offset);
    
    // Get welfare support requests
    const welfareSupportRequestsSnapshot = await query.get();
    
    const welfareSupportRequests: WelfareSupportRequest[] = welfareSupportRequestsSnapshot.docs.map((doc: FirebaseFirestore.QueryDocumentSnapshot) => {
      const data = doc.data() as WelfareSupportRequest;
      return {
        ...data,
        id: doc.id
      };
    });
    
    // Get total count
    const totalSnapshot = await db.collection('welfareSupport').get();
    const total = totalSnapshot.size;
    
    return {
      success: true,
      welfareSupportRequests,
      total
    };
  } catch (error: unknown) {
    console.error('List welfare support requests error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to list welfare support requests';
    return { success: false, error: errorMessage };
  }
}

// Update welfare support request status
export async function updateWelfareSupportRequestStatus(requestId: string, data: Record<string, unknown>, currentUser: AuthenticatedUser): Promise<BaseResult> {
  try {
    // Validate input
    const validatedData = updateWelfareSupportStatusSchema.parse(data);
    
    // Only authenticated users can update welfare support requests
    if (!currentUser) {
      return { success: false, error: 'Authentication required' };
    }
    
    // Check if db is initialized
    if (!db) {
      return { success: false, error: 'Database not initialized' };
    }
    
    // Get welfare support request from Firestore
    const welfareSupportRequestDoc = await db.collection('welfareSupport').doc(requestId).get();
    
    if (!welfareSupportRequestDoc.exists) {
      return { success: false, error: 'Welfare support request not found' };
    }
    
    const welfareSupportRequestData = welfareSupportRequestDoc.data() as WelfareSupportRequest | undefined;
    
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
  } catch (error: unknown) {
    console.error('Update welfare support request status error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to update welfare support request status';
    return { success: false, error: errorMessage };
  }
}

// Delete welfare support request
export async function deleteWelfareSupportRequest(requestId: string, currentUser: AuthenticatedUser): Promise<BaseResult> {
  try {
    // Only authenticated users can delete welfare support requests
    if (!currentUser) {
      return { success: false, error: 'Authentication required' };
    }
    
    // Check if db is initialized
    if (!db) {
      return { success: false, error: 'Database not initialized' };
    }
    
    // Get welfare support request from Firestore
    const welfareSupportRequestDoc = await db.collection('welfareSupport').doc(requestId).get();
    
    if (!welfareSupportRequestDoc.exists) {
      return { success: false, error: 'Welfare support request not found' };
    }
    
    const welfareSupportRequestData = welfareSupportRequestDoc.data() as WelfareSupportRequest | undefined;
    
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
  } catch (error: unknown) {
    console.error('Delete welfare support request error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to delete welfare support request';
    return { success: false, error: errorMessage };
  }
}