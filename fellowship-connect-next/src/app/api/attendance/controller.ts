import { getFirebaseAdmin } from '@/lib/firebaseAdmin';
import { createQRSessionSchema, checkInSchema } from '@/lib/schemas';
import { AuthenticatedUser } from '@/lib/authMiddleware';
import type FirebaseFirestore from 'firebase-admin/firestore';

interface QRSession {
  id?: string;
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
  location: string;
  createdBy: string;
  createdAt: string;
  isActive: boolean;
  qrCodeData: string;
  attendees: { userId: string; checkedInAt: string }[];
  [key: string]: unknown;
}

interface AttendanceRecord {
  id?: string;
  sessionId: string;
  userId: string;
  checkedInAt: string;
  sessionTitle?: string;
  userFullName?: string;
  userEmail?: string;
  isOfflineSync?: boolean;
  syncedAt?: string;
  [key: string]: unknown;
}

interface SessionDetailsResult {
  success: boolean;
  message?: string;
  error?: string;
  session?: QRSession;
}

interface CheckInResult {
  success: boolean;
  message?: string;
  error?: string;
  attendanceRecord?: AttendanceRecord;
}

interface BaseResult {
  success: boolean;
  message?: string;
  error?: string;
}

interface SyncResult {
  success: boolean;
  message?: string;
  error?: string;
  syncedCount?: number;
}

interface ReportsResult {
  success: boolean;
  message?: string;
  error?: string;
  reports?: {
    totalAttendees: number;
    uniqueUsers: number;
    attendanceRecords: AttendanceRecord[];
    generatedAt: string;
  };
}

interface StatisticsResult {
  success: boolean;
  message?: string;
  error?: string;
  stats?: {
    totalUsers: number;
    totalSessions: number;
    totalAttendance: number;
    recentSessions: number;
    generatedAt: string;
  };
}

// Helper function to get initialized db instance
async function getDb() {
  const firebaseAdmin = await getFirebaseAdmin();
  if (!firebaseAdmin.db) {
    throw new Error('Firebase database is not initialized');
  }
  return firebaseAdmin.db;
}

// Create QR session
export async function createQRSession(data: Record<string, unknown>, currentUser: AuthenticatedUser): Promise<SessionDetailsResult> {
  try {
    // Validate input
    const validatedData = createQRSessionSchema.parse(data);
    
    // Only authenticated users can create sessions
    if (!currentUser) {
      return { success: false, error: 'Authentication required' };
    }
    
    // Check if user has admin role
    const allowedRoles = ['admin', 'super-admin', 'chaplain'];
    const hasRole = allowedRoles.includes(currentUser.role);
    
    if (!hasRole) {
      return { success: false, error: 'Insufficient permissions' };
    }
    
    const db = await getDb();
    
    // Create QR session in Firestore
    const sessionData: Omit<QRSession, 'id'> = {
      title: validatedData.title,
      description: validatedData.description,
      startTime: validatedData.startTime,
      endTime: validatedData.endTime,
      location: validatedData.location,
      createdBy: currentUser.uid,
      createdAt: new Date().toISOString(),
      isActive: true,
      qrCodeData: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      attendees: []
    };
    
    const sessionRef = await db.collection('qrCodeSessions').add(sessionData);
    
    const title = typeof sessionData.title === 'string' ? sessionData.title : '';
    const description = typeof sessionData.description === 'string' ? sessionData.description : undefined;
    const startTime = typeof sessionData.startTime === 'string' ? sessionData.startTime : '';
    const endTime = typeof sessionData.endTime === 'string' ? sessionData.endTime : '';
    const location = typeof sessionData.location === 'string' ? sessionData.location : '';
    const createdBy = typeof sessionData.createdBy === 'string' ? sessionData.createdBy : '';
    const createdAt = typeof sessionData.createdAt === 'string' ? sessionData.createdAt : '';
    const isActive = typeof sessionData.isActive === 'boolean' ? sessionData.isActive : false;
    const qrCodeData = typeof sessionData.qrCodeData === 'string' ? sessionData.qrCodeData : '';
    const attendees = Array.isArray(sessionData.attendees) ? sessionData.attendees : [];
    
    const session: QRSession = {
      id: sessionRef.id,
      title,
      description,
      startTime,
      endTime,
      location,
      createdBy,
      createdAt,
      isActive,
      qrCodeData,
      attendees
    };
    
    return {
      success: true,
      message: 'QR session created successfully',
      session
    };
  } catch (error: unknown) {
    console.error('Create QR session error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to create QR session';
    return { success: false, error: errorMessage };
  }
}

// Get session details
export async function getSessionDetails(sessionId: string, currentUser: AuthenticatedUser): Promise<SessionDetailsResult> {
  try {
    // Only authenticated users can get session details
    if (!currentUser) {
      return { success: false, error: 'Authentication required' };
    }
    
    const db = await getDb();
    
    // Get session from Firestore
    const sessionDoc = await db.collection('qrCodeSessions').doc(sessionId).get();
    
    if (!sessionDoc.exists) {
      return { success: false, error: 'Session not found' };
    }
    
    const sessionData = sessionDoc.data();
    if (!sessionData) {
      return { success: false, error: 'Session data is invalid' };
    }
    
    // Type-safe extraction of session properties
    const title = typeof sessionData.title === 'string' ? sessionData.title : '';
    const description = typeof sessionData.description === 'string' ? sessionData.description : undefined;
    const startTime = typeof sessionData.startTime === 'string' ? sessionData.startTime : '';
    const endTime = typeof sessionData.endTime === 'string' ? sessionData.endTime : '';
    const location = typeof sessionData.location === 'string' ? sessionData.location : '';
    const createdBy = typeof sessionData.createdBy === 'string' ? sessionData.createdBy : '';
    const createdAt = typeof sessionData.createdAt === 'string' ? sessionData.createdAt : '';
    const isActive = typeof sessionData.isActive === 'boolean' ? sessionData.isActive : false;
    const qrCodeData = typeof sessionData.qrCodeData === 'string' ? sessionData.qrCodeData : '';
    const attendees = Array.isArray(sessionData.attendees) ? sessionData.attendees : [];
    
    const session: QRSession = {
      id: sessionDoc.id,
      title,
      description,
      startTime,
      endTime,
      location,
      createdBy,
      createdAt,
      isActive,
      qrCodeData,
      attendees
    };
    
    return {
      success: true,
      session
    };
  } catch (error: unknown) {
    console.error('Get session details error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to get session details';
    return { success: false, error: errorMessage };
  }
}

// Close session
export async function closeSession(sessionId: string, currentUser: AuthenticatedUser): Promise<BaseResult> {
  try {
    // Only authenticated users can close sessions
    if (!currentUser) {
      return { success: false, error: 'Authentication required' };
    }
    
    const db = await getDb();
    
    // Get session from Firestore
    const sessionDoc = await db.collection('qrCodeSessions').doc(sessionId).get();
    
    if (!sessionDoc.exists) {
      return { success: false, error: 'Session not found' };
    }
    
    const sessionData: any = sessionDoc.data();
    
    // Check if user is the creator or has admin role
    const allowedRoles = ['admin', 'super-admin', 'chaplain'];
    const hasRole = allowedRoles.includes(currentUser.role);
    
    if (sessionData?.createdBy !== currentUser.uid && !hasRole) {
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
  } catch (error: unknown) {
    console.error('Close session error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to close session';
    return { success: false, error: errorMessage };
  }
}

// Check-in
export async function checkIn(data: Record<string, unknown>, currentUser: AuthenticatedUser): Promise<CheckInResult> {
  try {
    // Validate input
    const validatedData = checkInSchema.parse(data);
    
    // Only authenticated users can check in
    if (!currentUser) {
      return { success: false, error: 'Authentication required' };
    }
    
    const db = await getDb();
    
    // Get session from Firestore
    const sessionDoc = await db.collection('qrCodeSessions').doc(validatedData.sessionId).get();
    
    if (!sessionDoc.exists) {
      return { success: false, error: 'Session not found' };
    }
    
    const sessionData: any = sessionDoc.data();
    
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
    const attendanceData: Omit<AttendanceRecord, 'id'> = {
      sessionId: validatedData.sessionId,
      userId: currentUser.uid,
      checkedInAt: new Date().toISOString(),
      sessionTitle: sessionData?.title || '',
      userFullName: currentUser.customClaims?.name || '',
      userEmail: currentUser.email || ''
    };
    
    const attendanceRef = await db.collection('attendance').add(attendanceData);
    
    // Update session attendees list
    const attendees = sessionData?.attendees || [];
    attendees.push({
      userId: currentUser.uid,
      checkedInAt: new Date().toISOString()
    });
    
    await db.collection('qrCodeSessions').doc(validatedData.sessionId).update({
      attendees: attendees
    });
    
    const attendanceRecord: AttendanceRecord = {
      id: attendanceRef.id,
      sessionId: validatedData.sessionId,
      userId: currentUser.uid,
      checkedInAt: new Date().toISOString(),
      sessionTitle: sessionData?.title || '',
      userFullName: (typeof currentUser.customClaims?.name === 'string' ? currentUser.customClaims.name : '') || '',
      userEmail: currentUser.email || ''
    };
    
    return {
      success: true,
      message: 'Check-in successful',
      attendanceRecord
    };
  } catch (error: unknown) {
    console.error('Check-in error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to check in';
    return { success: false, error: errorMessage };
  }
}

// Sync offline records
export async function syncOfflineRecords(data: Record<string, unknown>[], currentUser: AuthenticatedUser): Promise<SyncResult> {
  try {
    // Only authenticated users can sync offline records
    if (!currentUser) {
      return { success: false, error: 'Authentication required' };
    }
    
    const db = await getDb();
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
          const attendanceData: Omit<AttendanceRecord, 'id'> = {
            sessionId: record.sessionId as string,
            userId: currentUser.uid,
            checkedInAt: record.checkedInAt as string,
            sessionTitle: (record.sessionTitle as string) || '',
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
  } catch (error: unknown) {
    console.error('Sync offline records error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to sync offline records';
    return { success: false, error: errorMessage };
  }
}

// Generate reports
export async function generateReports(filters: Record<string, unknown>, currentUser: AuthenticatedUser): Promise<ReportsResult> {
  try {
    // Only admins can generate reports
    const allowedRoles = ['admin', 'super-admin', 'chaplain'];
    const hasRole = allowedRoles.includes(currentUser.role);
    
    if (!hasRole) {
      return { success: false, error: 'Insufficient permissions' };
    }
    
    const db = await getDb();
    
    // Build query based on filters
    let query: FirebaseFirestore.Query = db.collection('attendance');
    
    if (filters.startDate) {
      query = query.where('checkedInAt', '>=', filters.startDate as string);
    }
    
    if (filters.endDate) {
      query = query.where('checkedInAt', '<=', filters.endDate as string);
    }
    
    if (filters.sessionId) {
      query = query.where('sessionId', '==', filters.sessionId as string);
    }
    
    // Get attendance records
    const attendanceSnapshot = await query.get();
    
    const attendanceRecords: AttendanceRecord[] = attendanceSnapshot.docs.map((doc: FirebaseFirestore.QueryDocumentSnapshot) => {
      const data: any = doc.data();
      return {
        id: doc.id,
        sessionId: data.sessionId as string,
        userId: data.userId as string,
        checkedInAt: data.checkedInAt as string,
        sessionTitle: data.sessionTitle as string | undefined,
        userFullName: data.userFullName as string | undefined,
        userEmail: data.userEmail as string | undefined,
        isOfflineSync: data.isOfflineSync as boolean | undefined,
        syncedAt: data.syncedAt as string | undefined
      };
    });
    
    // Generate summary statistics
    const totalAttendees = attendanceRecords.length;
    const uniqueUsers = [...new Set(attendanceRecords.map((record) => record.userId))].length;
    
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
  } catch (error: unknown) {
    console.error('Generate reports error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to generate reports';
    return { success: false, error: errorMessage };
  }
}

// Get statistics
export async function getStatistics(currentUser: AuthenticatedUser): Promise<StatisticsResult> {
  try {
    // Only admins can get statistics
    const allowedRoles = ['admin', 'super-admin', 'chaplain'];
    const hasRole = allowedRoles.includes(currentUser.role);
    
    if (!hasRole) {
      return { success: false, error: 'Insufficient permissions' };
    }
    
    const db = await getDb();
    
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
  } catch (error: unknown) {
    console.error('Get statistics error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to get statistics';
    return { success: false, error: errorMessage };
  }
}