import { db } from '@/lib/firebaseAdmin';
import { createQRSessionSchema, checkInSchema } from '@/lib/schemas';
import { AuthenticatedUser } from '@/lib/authMiddleware';

// Create QR session
export async function createQRSession(data: any, currentUser: AuthenticatedUser): Promise<{ success: boolean; message?: string; error?: string; session?: any }> {
  try {
    // Validate input
    const validatedData = createQRSessionSchema.parse(data);
    
    // Only authenticated users can create sessions
    if (!currentUser) {
      return { success: false, error: 'Authentication required' };
    }
    
    // Create QR session in Firestore
    const sessionData = {
      ...validatedData,
      createdBy: currentUser.uid,
      createdAt: new Date().toISOString(),
      isActive: true,
      qrCodeData: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      attendees: []
    };
    
    const sessionRef = await db.collection('qrCodeSessions').add(sessionData);
    
    return {
      success: true,
      message: 'QR session created successfully',
      session: {
        id: sessionRef.id,
        ...sessionData
      }
    };
  } catch (error: any) {
    console.error('Create QR session error:', error);
    return { success: false, error: error.message || 'Failed to create QR session' };
  }
}

// Get session details
export async function getSessionDetails(sessionId: string, currentUser: AuthenticatedUser): Promise<{ success: boolean; message?: string; error?: string; session?: any }> {
  try {
    // Only authenticated users can get session details
    if (!currentUser) {
      return { success: false, error: 'Authentication required' };
    }
    
    // Get session from Firestore
    const sessionDoc = await db.collection('qrCodeSessions').doc(sessionId).get();
    
    if (!sessionDoc.exists) {
      return { success: false, error: 'Session not found' };
    }
    
    const sessionData = sessionDoc.data();
    
    return {
      success: true,
      session: {
        id: sessionDoc.id,
        ...sessionData
      }
    };
  } catch (error: any) {
    console.error('Get session details error:', error);
    return { success: false, error: error.message || 'Failed to get session details' };
  }
}

// Close session
export async function closeSession(sessionId: string, currentUser: AuthenticatedUser): Promise<{ success: boolean; message?: string; error?: string }> {
  try {
    // Only authenticated users can close sessions
    if (!currentUser) {
      return { success: false, error: 'Authentication required' };
    }
    
    // Get session from Firestore
    const sessionDoc = await db.collection('qrCodeSessions').doc(sessionId).get();
    
    if (!sessionDoc.exists) {
      return { success: false, error: 'Session not found' };
    }
    
    const sessionData = sessionDoc.data();
    
    // Check if user is the creator or an admin
    if (sessionData?.createdBy !== currentUser.uid && !['admin', 'super-admin', 'chaplain'].includes(currentUser.role)) {
      return { success: false, error: 'Insufficient permissions' };
    }
    
    // Update session to inactive
    await db.collection('qrCodeSessions').doc(sessionId).update({
      isActive: false,
      closedAt: new Date().toISOString()
    });
    
    return {
      success: true,
      message: 'Session closed successfully'
    };
  } catch (error: any) {
    console.error('Close session error:', error);
    return { success: false, error: error.message || 'Failed to close session' };
  }
}

// Check-in
export async function checkIn(data: any, currentUser: AuthenticatedUser): Promise<{ success: boolean; message?: string; error?: string; attendanceRecord?: any }> {
  try {
    // Validate input
    const validatedData = checkInSchema.parse(data);
    
    // Only authenticated users can check in
    if (!currentUser) {
      return { success: false, error: 'Authentication required' };
    }
    
    // Get session from Firestore
    const sessionDoc = await db.collection('qrCodeSessions').doc(validatedData.sessionId).get();
    
    if (!sessionDoc.exists) {
      return { success: false, error: 'Session not found' };
    }
    
    const sessionData = sessionDoc.data();
    
    // Check if session is active
    if (!sessionData?.isActive) {
      return { success: false, error: 'Session is not active' };
    }
    
    // Check if user has already checked in
    const existingAttendance = await db.collection('attendance')
      .where('sessionId', '==', validatedData.sessionId)
      .where('userId', '==', currentUser.uid)
      .get();
    
    if (!existingAttendance.empty) {
      return { success: false, error: 'User already checked in for this session' };
    }
    
    // Validate QR code if provided
    if (validatedData.qrCodeData && validatedData.qrCodeData !== sessionData?.qrCodeData) {
      return { success: false, error: 'Invalid QR code' };
    }
    
    // Create attendance record
    const attendanceData = {
      sessionId: validatedData.sessionId,
      userId: currentUser.uid,
      checkedInAt: new Date().toISOString(),
      sessionTitle: sessionData?.title || '',
      userFullName: currentUser.customClaims?.name || '',
      userEmail: currentUser.email || ''
    };
    
    const attendanceRef = await db.collection('attendance').add(attendanceData);
    
    // Update session attendees list
    await db.collection('qrCodeSessions').doc(validatedData.sessionId).update({
      attendees: [...(sessionData?.attendees || []), {
        userId: currentUser.uid,
        checkedInAt: new Date().toISOString()
      }]
    });
    
    return {
      success: true,
      message: 'Check-in successful',
      attendanceRecord: {
        id: attendanceRef.id,
        ...attendanceData
      }
    };
  } catch (error: any) {
    console.error('Check-in error:', error);
    return { success: false, error: error.message || 'Failed to check in' };
  }
}

// Sync offline records
export async function syncOfflineRecords(data: any[], currentUser: AuthenticatedUser): Promise<{ success: boolean; message?: string; error?: string; syncedCount?: number }> {
  try {
    // Only authenticated users can sync offline records
    if (!currentUser) {
      return { success: false, error: 'Authentication required' };
    }
    
    let syncedCount = 0;
    
    // Process each offline record
    for (const record of data) {
      try {
        // Check if record already exists
        const existingRecord = await db.collection('attendance')
          .where('sessionId', '==', record.sessionId)
          .where('userId', '==', currentUser.uid)
          .where('checkedInAt', '==', record.checkedInAt)
          .get();
        
        if (existingRecord.empty) {
          // Create attendance record
          const attendanceData = {
            sessionId: record.sessionId,
            userId: currentUser.uid,
            checkedInAt: record.checkedInAt,
            sessionTitle: record.sessionTitle || '',
            userFullName: currentUser.customClaims?.name || '',
            userEmail: currentUser.email || '',
            isOfflineSync: true,
            syncedAt: new Date().toISOString()
          };
          
          await db.collection('attendance').add(attendanceData);
          syncedCount++;
        }
      } catch (recordError) {
        console.error('Error syncing individual record:', recordError);
        // Continue with other records
      }
    }
    
    return {
      success: true,
      message: `Successfully synced ${syncedCount} offline records`,
      syncedCount
    };
  } catch (error: any) {
    console.error('Sync offline records error:', error);
    return { success: false, error: error.message || 'Failed to sync offline records' };
  }
}

// Generate reports
export async function generateReports(filters: any, currentUser: AuthenticatedUser): Promise<{ success: boolean; message?: string; error?: string; reports?: any }> {
  try {
    // Only admins can generate reports
    if (!['admin', 'super-admin', 'chaplain'].includes(currentUser.role)) {
      return { success: false, error: 'Insufficient permissions' };
    }
    
    // Build query based on filters
    let query: any = db.collection('attendance');
    
    if (filters.startDate) {
      query = query.where('checkedInAt', '>=', filters.startDate);
    }
    
    if (filters.endDate) {
      query = query.where('checkedInAt', '<=', filters.endDate);
    }
    
    if (filters.sessionId) {
      query = query.where('sessionId', '==', filters.sessionId);
    }
    
    // Get attendance records
    const attendanceSnapshot = await query.get();
    
    const attendanceRecords = attendanceSnapshot.docs.map((doc: any) => ({
      id: doc.id,
      ...doc.data()
    }));
    
    // Generate summary statistics
    const totalAttendees = attendanceRecords.length;
    const uniqueUsers = [...new Set(attendanceRecords.map((record: any) => record.userId))].length;
    
    const reports = {
      totalAttendees,
      uniqueUsers,
      attendanceRecords,
      generatedAt: new Date().toISOString()
    };
    
    return {
      success: true,
      reports
    };
  } catch (error: any) {
    console.error('Generate reports error:', error);
    return { success: false, error: error.message || 'Failed to generate reports' };
  }
}

// Get statistics
export async function getStatistics(currentUser: AuthenticatedUser): Promise<{ success: boolean; message?: string; error?: string; stats?: any }> {
  try {
    // Only admins can get statistics
    if (!['admin', 'super-admin', 'chaplain'].includes(currentUser.role)) {
      return { success: false, error: 'Insufficient permissions' };
    }
    
    // Get total users
    const usersSnapshot = await db.collection('users').get();
    const totalUsers = usersSnapshot.size;
    
    // Get total sessions
    const sessionsSnapshot = await db.collection('qrCodeSessions').get();
    const totalSessions = sessionsSnapshot.size;
    
    // Get total attendance records
    const attendanceSnapshot = await db.collection('attendance').get();
    const totalAttendance = attendanceSnapshot.size;
    
    // Get recent sessions (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentSessionsSnapshot = await db.collection('qrCodeSessions')
      .where('createdAt', '>=', thirtyDaysAgo.toISOString())
      .get();
    const recentSessions = recentSessionsSnapshot.size;
    
    const stats = {
      totalUsers,
      totalSessions,
      totalAttendance,
      recentSessions,
      generatedAt: new Date().toISOString()
    };
    
    return {
      success: true,
      stats
    };
  } catch (error: any) {
    console.error('Get statistics error:', error);
    return { success: false, error: error.message || 'Failed to get statistics' };
  }
}