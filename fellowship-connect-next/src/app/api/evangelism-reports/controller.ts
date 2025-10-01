import { db } from '@/lib/firebaseAdmin';
import { createEvangelismReportSchema } from '@/lib/schemas';
import { AuthenticatedUser } from '@/lib/authMiddleware';

// Submit evangelism report
export async function submitEvangelismReport(data: any, currentUser: AuthenticatedUser): Promise<{ success: boolean; message?: string; error?: string; evangelismReport?: any }> {
  try {
    // Validate input
    const validatedData = createEvangelismReportSchema.parse(data);
    
    // Only authenticated users can submit evangelism reports
    if (!currentUser) {
      return { success: false, error: 'Authentication required' };
    }
    
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
  } catch (error: any) {
    console.error('Submit evangelism report error:', error);
    return { success: false, error: error.message || 'Failed to submit evangelism report' };
  }
}

// List evangelism reports
export async function listEvangelismReports(filters: any, currentUser: AuthenticatedUser): Promise<{ success: boolean; message?: string; error?: string; evangelismReports?: any[]; total?: number }> {
  try {
    // Only authenticated users can list evangelism reports
    if (!currentUser) {
      return { success: false, error: 'Authentication required' };
    }
    
    // Build query based on filters
    let query: any = db.collection('evangelismReports');
    
    // Filter by user (if not admin, only show own reports)
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
    
    // Get evangelism reports
    const evangelismReportsSnapshot = await query.get();
    
    const evangelismReports = evangelismReportsSnapshot.docs.map((doc: any) => ({
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
  } catch (error: any) {
    console.error('List evangelism reports error:', error);
    return { success: false, error: error.message || 'Failed to list evangelism reports' };
  }
}