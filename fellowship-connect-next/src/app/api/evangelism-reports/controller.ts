import { getFirebaseAdmin } from '@/lib/firebaseAdmin';
import { createEvangelismReportSchema } from '@/lib/schemas';
import { AuthenticatedUser } from '@/lib/authMiddleware';
import type FirebaseFirestore from 'firebase-admin/firestore';

// Helper function to get initialized db instance
async function getDb() {
  const firebaseAdmin = await getFirebaseAdmin();
  if (!firebaseAdmin.db) {
    throw new Error('Firebase database is not initialized');
  }
  return firebaseAdmin.db;
}

// Submit evangelism report
export async function submitEvangelismReport(data: Record<string, unknown>, currentUser: AuthenticatedUser): Promise<{ success: boolean; message?: string; error?: string; evangelismReport?: Record<string, unknown> }> {
  try {
    // Validate input
    const validatedData = createEvangelismReportSchema.parse(data);
    
    // Only authenticated users can submit evangelism reports
    if (!currentUser) {
      return { success: false, error: 'Authentication required' };
    }
    
    const db = await getDb();
    
    // Create evangelism report in Firestore
    const evangelismReportData = {
      ...validatedData,
      userId: currentUser.uid,
      userEmail: currentUser.email || '',
      userFullName: currentUser.customClaims?.name || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    const evangelismReportRef = await db.collection('evangelismReports').add(evangelismReportData);
    
    return {
      success: true,
      message: 'Evangelism report submitted successfully',
      evangelismReport: {
        id: evangelismReportRef.id,
        ...evangelismReportData
      }
    };
  } catch (error: unknown) {
    console.error('Submit evangelism report error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to submit evangelism report';
    return { success: false, error: errorMessage };
  }
}

// List evangelism reports
export async function listEvangelismReports(filters: Record<string, unknown>, currentUser: AuthenticatedUser): Promise<{ success: boolean; message?: string; error?: string; evangelismReports?: Record<string, unknown>[]; total?: number }> {
  try {
    // Only authenticated users can list evangelism reports
    if (!currentUser) {
      return { success: false, error: 'Authentication required' };
    }
    
    const db = await getDb();
    
    // Build query based on filters
    let query: FirebaseFirestore.Query = db.collection('evangelismReports');
    
    // Filter by user (if not admin, only show own reports)
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
    
    // Get evangelism reports
    const evangelismReportsSnapshot = await query.get();
    
    const evangelismReports = evangelismReportsSnapshot.docs.map((doc: FirebaseFirestore.QueryDocumentSnapshot) => ({
      id: doc.id,
      ...doc.data()
    }));
    
    // Get total count
    const totalSnapshot = await db.collection('evangelismReports').get();
    const total = totalSnapshot.size;
    
    return {
      success: true,
      evangelismReports,
      total
    };
  } catch (error: unknown) {
    console.error('List evangelism reports error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to list evangelism reports';
    return { success: false, error: errorMessage };
  }
}
