import { getFirebaseAdmin } from '@/lib/firebaseAdmin';
import { AuthenticatedUser } from '@/lib/authMiddleware';
import type FirebaseFirestore from 'firebase-admin/firestore';

interface DashboardStats {
  totalUsers: number;
  totalPrayerRequests: number;
  totalWelfareSupport: number;
  totalEvangelismReports: number;
  recentAttendance: number;
  generatedAt: string;
}

interface UserAnalytics {
  totalUsers: number;
  activeUsers: number;
  adminUsers: number;
  roleDistribution: Record<string, number>;
  generatedAt: string;
}

interface AttendanceAnalytics {
  totalCheckIns: number;
  uniqueUsers: number;
  dailyAttendance: Record<string, number>;
  generatedAt: string;
}

interface AuditLog {
  id: string;
  action: string;
  actorId: string;
  actorEmail?: string;
  targetId?: string;
  changes?: Record<string, unknown>;
  timestamp: string;
  [key: string]: unknown;
}

interface UserData {
  uid: string;
  email?: string;
  displayName?: string;
  role: string;
  active?: boolean;
  createdAt?: string;
  [key: string]: unknown;
}

interface AttendanceRecord {
  userId: string;
  checkedInAt: string;
  [key: string]: unknown;
}

// Get dashboard statistics
export async function getDashboardStats(currentUser: AuthenticatedUser): Promise<{ success: boolean; message?: string; error?: string; stats?: DashboardStats }> {
  try {
    // Only admins can access dashboard
    if (!['admin', 'super-admin', 'chaplain'].includes(currentUser.role)) {
      return { success: false, error: 'Insufficient permissions' };
    }
    
    // Initialize Firebase Admin and get db instance
    const { db } = await getFirebaseAdmin();
    if (!db) {
      return { success: false, error: 'Database not initialized' };
    }
    
    // Get total users
    const usersSnapshot = await db.collection('users').get();
    const totalUsers = usersSnapshot.size;
    
    // Get total prayer requests
    const prayerRequestsSnapshot = await db.collection('prayerRequests').get();
    const totalPrayerRequests = prayerRequestsSnapshot.size;
    
    // Get total welfare support requests
    const welfareSupportSnapshot = await db.collection('welfareSupport').get();
    const totalWelfareSupport = welfareSupportSnapshot.size;
    
    // Get total evangelism reports
    const evangelismReportsSnapshot = await db.collection('evangelismReports').get();
    const totalEvangelismReports = evangelismReportsSnapshot.size;
    
    // Get recent attendance (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentAttendanceSnapshot = await db.collection('attendance')
      .where('checkedInAt', '>=', thirtyDaysAgo.toISOString())
      .get();
    const recentAttendance = recentAttendanceSnapshot.size;
    
    const stats: DashboardStats = {
      totalUsers,
      totalPrayerRequests,
      totalWelfareSupport,
      totalEvangelismReports,
      recentAttendance,
      generatedAt: new Date().toISOString()
    };
    
    return {
      success: true,
      stats
    };
  } catch (error: unknown) {
    console.error('Get dashboard stats error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to get dashboard stats';
    return { success: false, error: errorMessage };
  }
}

// Get user analytics
export async function getUserAnalytics(filters: Record<string, unknown>, currentUser: AuthenticatedUser): Promise<{ success: boolean; message?: string; error?: string; analytics?: UserAnalytics }> {
  try {
    // Only admins can access user analytics
    if (!['admin', 'super-admin', 'chaplain'].includes(currentUser.role)) {
      return { success: false, error: 'Insufficient permissions' };
    }
    
    // Initialize Firebase Admin and get db instance
    const { db } = await getFirebaseAdmin();
    if (!db) {
      return { success: false, error: 'Database not initialized' };
    }
    
    // Get user data
    const usersSnapshot = await db.collection('users').get();
    const users: UserData[] = usersSnapshot.docs.map((doc: FirebaseFirestore.QueryDocumentSnapshot) => {
      const data = doc.data() as UserData;
      return {
        ...data,
        id: doc.id // Explicitly set the id from the document
      };
    });
    
    // Calculate analytics
    const totalUsers = users.length;
    const activeUsers = users.filter((user) => user.active).length;
    const adminUsers = users.filter((user) => ['admin', 'super-admin', 'chaplain'].includes(user.role)).length;
    
    // Group by role
    const roleDistribution: Record<string, number> = {};
    users.forEach((user) => {
      const role = user.role || 'member';
      roleDistribution[role] = (roleDistribution[role] || 0) + 1;
    });
    
    const analytics: UserAnalytics = {
      totalUsers,
      activeUsers,
      adminUsers,
      roleDistribution,
      generatedAt: new Date().toISOString()
    };
    
    return {
      success: true,
      analytics
    };
  } catch (error: unknown) {
    console.error('Get user analytics error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to get user analytics';
    return { success: false, error: errorMessage };
  }
}

// Get attendance analytics
export async function getAttendanceAnalytics(filters: Record<string, unknown>, currentUser: AuthenticatedUser): Promise<{ success: boolean; message?: string; error?: string; analytics?: AttendanceAnalytics }> {
  try {
    // Only admins can access attendance analytics
    if (!['admin', 'super-admin', 'chaplain'].includes(currentUser.role)) {
      return { success: false, error: 'Insufficient permissions' };
    }
    
    // Initialize Firebase Admin and get db instance
    const { db } = await getFirebaseAdmin();
    if (!db) {
      return { success: false, error: 'Database not initialized' };
    }
    
    // Build query based on filters
    let query: FirebaseFirestore.Query = db.collection('attendance');
    
    if (filters.startDate) {
      query = query.where('checkedInAt', '>=', filters.startDate as string);
    }
    
    if (filters.endDate) {
      query = query.where('checkedInAt', '<=', filters.endDate as string);
    }
    
    // Get attendance records
    const attendanceSnapshot = await query.get();
    const attendanceRecords: AttendanceRecord[] = attendanceSnapshot.docs.map((doc: FirebaseFirestore.QueryDocumentSnapshot) => {
      const data = doc.data() as AttendanceRecord;
      return {
        ...data,
        id: doc.id // Explicitly set the id from the document
      };
    });
    
    // Calculate analytics
    const totalCheckIns = attendanceRecords.length;
    const uniqueUsers = [...new Set(attendanceRecords.map((record) => record.userId))].length;
    
    // Group by date
    const dailyAttendance: Record<string, number> = {};
    attendanceRecords.forEach((record) => {
      const date = record.checkedInAt.split('T')[0];
      dailyAttendance[date] = (dailyAttendance[date] || 0) + 1;
    });
    
    const analytics: AttendanceAnalytics = {
      totalCheckIns,
      uniqueUsers,
      dailyAttendance,
      generatedAt: new Date().toISOString()
    };
    
    return {
      success: true,
      analytics
    };
  } catch (error: unknown) {
    console.error('Get attendance analytics error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to get attendance analytics';
    return { success: false, error: errorMessage };
  }
}

// Export data
export async function exportData(exportType: string, filters: Record<string, unknown>, currentUser: AuthenticatedUser): Promise<{ success: boolean; message?: string; error?: string; data?: Record<string, unknown>[]; fileName?: string }> {
  try {
    // Only admins can export data
    if (!['admin', 'super-admin', 'chaplain'].includes(currentUser.role)) {
      return { success: false, error: 'Insufficient permissions' };
    }
    
    // Initialize Firebase Admin and get db instance
    const { db } = await getFirebaseAdmin();
    if (!db) {
      return { success: false, error: 'Database not initialized' };
    }
    
    let data: Record<string, unknown>[] = [];
    let fileName = '';
    
    switch (exportType) {
      case 'users':
        const usersSnapshot = await db.collection('users').get();
        data = usersSnapshot.docs.map((doc: FirebaseFirestore.QueryDocumentSnapshot) => {
          const docData = doc.data() as Record<string, unknown>;
          return {
            ...docData,
            id: doc.id // Explicitly set the id from the document
          };
        });
        fileName = `users-export-${new Date().toISOString().split('T')[0]}.json`;
        break;
        
      case 'attendance':
        let attendanceQuery: FirebaseFirestore.Query = db.collection('attendance');
        
        if (filters.startDate) {
          attendanceQuery = attendanceQuery.where('checkedInAt', '>=', filters.startDate as string);
        }
        
        if (filters.endDate) {
          attendanceQuery = attendanceQuery.where('checkedInAt', '<=', filters.endDate as string);
        }
        
        const attendanceSnapshot = await attendanceQuery.get();
        data = attendanceSnapshot.docs.map((doc: FirebaseFirestore.QueryDocumentSnapshot) => {
          const docData = doc.data() as Record<string, unknown>;
          return {
            ...docData,
            id: doc.id // Explicitly set the id from the document
          };
        });
        fileName = `attendance-export-${new Date().toISOString().split('T')[0]}.json`;
        break;
        
      case 'prayer-requests':
        const prayerRequestsSnapshot = await db.collection('prayerRequests').get();
        data = prayerRequestsSnapshot.docs.map((doc: FirebaseFirestore.QueryDocumentSnapshot) => {
          const docData = doc.data() as Record<string, unknown>;
          return {
            ...docData,
            id: doc.id // Explicitly set the id from the document
          };
        });
        fileName = `prayer-requests-export-${new Date().toISOString().split('T')[0]}.json`;
        break;
        
      default:
        return { success: false, error: 'Invalid export type' };
    }
    
    return {
      success: true,
      data,
      fileName
    };
  } catch (error: unknown) {
    console.error('Export data error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to export data';
    return { success: false, error: errorMessage };
  }
}

// Get audit logs
export async function getAuditLogs(filters: Record<string, unknown>, currentUser: AuthenticatedUser): Promise<{ success: boolean; message?: string; error?: string; auditLogs?: AuditLog[]; total?: number }> {
  try {
    // Only admins can access audit logs
    if (!['admin', 'super-admin', 'chaplain'].includes(currentUser.role)) {
      return { success: false, error: 'Insufficient permissions' };
    }
    
    // Initialize Firebase Admin and get db instance
    const { db } = await getFirebaseAdmin();
    if (!db) {
      return { success: false, error: 'Database not initialized' };
    }
    
    // Build query based on filters
    let query: FirebaseFirestore.Query = db.collection('auditLogs');
    
    if (filters.action) {
      query = query.where('action', '==', filters.action as string);
    }
    
    if (filters.actorId) {
      query = query.where('actorId', '==', filters.actorId as string);
    }
    
    // Order by timestamp
    query = query.orderBy('timestamp', 'desc');
    
    // Apply pagination
    const page = (filters.page as number) || 1;
    const limit = (filters.limit as number) || 10;
    const offset = (page - 1) * limit;
    
    query = query.limit(limit).offset(offset);
    
    // Get audit logs
    const auditLogsSnapshot = await query.get();
    
    const auditLogs: AuditLog[] = auditLogsSnapshot.docs.map((doc: FirebaseFirestore.QueryDocumentSnapshot) => {
      const docData = doc.data() as AuditLog;
      return {
        ...docData,
        id: doc.id // Explicitly set the id from the document
      };
    });
    
    // Get total count
    const totalSnapshot = await db.collection('auditLogs').get();
    const total = totalSnapshot.size;
    
    return {
      success: true,
      auditLogs,
      total
    };
  } catch (error: unknown) {
    console.error('Get audit logs error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to get audit logs';
    return { success: false, error: errorMessage };
  }
}