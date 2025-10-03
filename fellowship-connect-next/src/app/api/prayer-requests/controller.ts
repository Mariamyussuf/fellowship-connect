import { getFirebaseAdmin } from '@/lib/firebaseAdmin';
import { createPrayerRequestSchema, updatePrayerRequestStatusSchema } from '@/lib/schemas';
import { AuthenticatedUser } from '@/lib/authMiddleware';
import type FirebaseFirestore from 'firebase-admin/firestore';

interface PrayerRequest {
  id?: string;
  title: string;
  description: string;
  isPublic: boolean;
  isAnonymous: boolean;
  userId: string;
  userEmail?: string;
  userFullName?: string;
  status: 'pending' | 'approved' | 'rejected' | 'answered';
  notes?: string;
  createdAt: string;
  updatedAt: string;
  [key: string]: unknown;
}

interface SubmitPrayerRequestResult {
  success: boolean;
  message?: string;
  error?: string;
  prayerRequest?: PrayerRequest;
}

interface ListPrayerRequestsResult {
  success: boolean;
  message?: string;
  error?: string;
  prayerRequests?: PrayerRequest[];
  total?: number;
}

interface BaseResult {
  success: boolean;
  message?: string;
  error?: string;
}

// Submit prayer request
export async function submitPrayerRequest(data: Record<string, unknown>, currentUser: AuthenticatedUser): Promise<SubmitPrayerRequestResult> {
  try {
    // Validate input
    const validatedData = createPrayerRequestSchema.parse(data);
    
    // Only authenticated users can submit prayer requests
    if (!currentUser) {
      return { success: false, error: 'Authentication required' };
    }
    
    // Get Firebase services
    const { db } = await getFirebaseAdmin();
    if (!db) {
      return { success: false, error: 'Database not available' };
    }
    
    // Create prayer request in Firestore
    const prayerRequestData: Omit<PrayerRequest, 'id'> = {
      title: validatedData.title,
      description: validatedData.description,
      isPublic: validatedData.isPublic,
      isAnonymous: validatedData.isAnonymous,
      userId: currentUser.uid,
      userEmail: currentUser.email || '',
      userFullName: currentUser.customClaims?.name || '',
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    const prayerRequestRef = await db.collection('prayerRequests').add(prayerRequestData);
    
    const fullPrayerRequest: PrayerRequest = {
      ...prayerRequestData,
      id: prayerRequestRef.id,
      title: '',
      description: '',
      isPublic: false,
      isAnonymous: false,
      userId: '',
      status: 'pending',
      createdAt: '',
      updatedAt: ''
    };
    
    return {
      success: true,
      message: 'Prayer request submitted successfully',
      prayerRequest: fullPrayerRequest
    };
  } catch (error: unknown) {
    console.error('Submit prayer request error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to submit prayer request';
    return { success: false, error: errorMessage };
  }
}

// List prayer requests
export async function listPrayerRequests(filters: Record<string, unknown>, currentUser: AuthenticatedUser): Promise<ListPrayerRequestsResult> {
  try {
    // Only authenticated users can list prayer requests
    if (!currentUser) {
      return { success: false, error: 'Authentication required' };
    }
    
    // Get Firebase services
    const { db } = await getFirebaseAdmin();
    if (!db) {
      return { success: false, error: 'Database not available' };
    }
    
    // Build query based on filters
    let query: FirebaseFirestore.Query = db.collection('prayerRequests');
    
    // Filter by status
    if (filters.status) {
      query = query.where('status', '==', filters.status as string);
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
    const page = (filters.page as number) || 1;
    const limit = (filters.limit as number) || 10;
    const offset = (page - 1) * limit;
    
    query = query.limit(limit).offset(offset);
    
    // Get prayer requests
    const prayerRequestsSnapshot = await query.get();
    
    const prayerRequests: PrayerRequest[] = prayerRequestsSnapshot.docs.map((doc: FirebaseFirestore.QueryDocumentSnapshot) => {
      const data = doc.data() as PrayerRequest;
      return {
        ...data,
        id: doc.id
      };
    });
    
    // Get total count
    const totalSnapshot = await db.collection('prayerRequests').get();
    const total = totalSnapshot.size;
    
    return {
      success: true,
      prayerRequests,
      total
    };
  } catch (error: unknown) {
    console.error('List prayer requests error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to list prayer requests';
    return { success: false, error: errorMessage };
  }
}

// Update prayer request status
export async function updatePrayerRequestStatus(requestId: string, data: Record<string, unknown>, currentUser: AuthenticatedUser): Promise<BaseResult> {
  try {
    // Validate input
    const validatedData = updatePrayerRequestStatusSchema.parse(data);
    
    // Only authenticated users can update prayer requests
    if (!currentUser) {
      return { success: false, error: 'Authentication required' };
    }
    
    // Get Firebase services
    const { db } = await getFirebaseAdmin();
    if (!db) {
      return { success: false, error: 'Database not available' };
    }
    
    // Get prayer request from Firestore
    const prayerRequestDoc = await db.collection('prayerRequests').doc(requestId).get();
    
    if (!prayerRequestDoc.exists) {
      return { success: false, error: 'Prayer request not found' };
    }
    
    const prayerRequestData = prayerRequestDoc.data() as PrayerRequest | undefined;
    
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
  } catch (error: unknown) {
    console.error('Update prayer request status error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to update prayer request status';
    return { success: false, error: errorMessage };
  }
}

// Delete prayer request
export async function deletePrayerRequest(requestId: string, currentUser: AuthenticatedUser): Promise<BaseResult> {
  try {
    // Only authenticated users can delete prayer requests
    if (!currentUser) {
      return { success: false, error: 'Authentication required' };
    }
    
    // Get Firebase services
    const { db } = await getFirebaseAdmin();
    if (!db) {
      return { success: false, error: 'Database not available' };
    }
    
    // Get prayer request from Firestore
    const prayerRequestDoc = await db.collection('prayerRequests').doc(requestId).get();
    
    if (!prayerRequestDoc.exists) {
      return { success: false, error: 'Prayer request not found' };
    }
    
    const prayerRequestData = prayerRequestDoc.data() as PrayerRequest | undefined;
    
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
  } catch (error: unknown) {
    console.error('Delete prayer request error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to delete prayer request';
    return { success: false, error: errorMessage };
  }
}