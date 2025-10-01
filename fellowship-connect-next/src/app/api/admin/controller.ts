import { db } from '@/lib/firebaseAdmin';
import { AuthenticatedUser } from '@/lib/authMiddleware';

// Get dashboard statistics
export async function getDashboardStats(currentUser: AuthenticatedUser): Promise<{ success: boolean; message?: string; error?: string; stats?: any }> {
  try {
    // Only admins can access dashboard
    if (!['admin', 'super-admin', 'chaplain'].includes(currentUser.role)) {
      return { success: false, error: 'Insufficient permissions' };
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
    
    const stats = {
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
  } catch (error: any) {
    console.error('Get dashboard stats error:', error);
    return { success: false, error: error.message || 'Failed to get dashboard stats' };
  }
}

// Get user analytics
export async function getUserAnalytics(filters: any, currentUser: AuthenticatedUser): Promise<{ success: boolean; message?: string; error?: string; analytics?: any }> {
  try {
    // Only admins can access user analytics
    if (!['admin', 'super-admin', 'chaplain'].includes(currentUser.role)) {
      return { success: false, error: 'Insufficient permissions' };
    }
    
    // Get user data
    const usersSnapshot = await db.collection('users').get();
    const users = usersSnapshot.docs.map((doc: any) => ({
      id: doc.id,
      ...doc.data()
    }));
    
    // Calculate analytics
    const totalUsers = users.length;
    const activeUsers = users.filter((user: any) => user.active).length;
    const adminUsers = users.filter((user: any) => ['admin', 'super-admin', 'chaplain'].includes(user.role)).length;
    
    // Group by role
    const roleDistribution: any = {};
    users.forEach((user: any) => {
      const role = user.role || 'member';
      roleDistribution[role] = (roleDistribution[role] || 0) + 1;
    });
    
    const analytics = {
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
  } catch (error: any) {
    console.error('Get user analytics error:', error);
    return { success: false, error: error.message || 'Failed to get user analytics' };
  }
}

// Get attendance analytics
export async function getAttendanceAnalytics(filters: any, currentUser: AuthenticatedUser): Promise<{ success: boolean; message?: string; error?: string; analytics?: any }> {
  try {
    // Only admins can access attendance analytics
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
    
    // Get attendance records
    const attendanceSnapshot = await query.get();
    const attendanceRecords = attendanceSnapshot.docs.map((doc: any) => ({
      id: doc.id,
      ...doc.data()
    }));
    
    // Calculate analytics
    const totalCheckIns = attendanceRecords.length;
    const uniqueUsers = [...new Set(attendanceRecords.map((record: any) => record.userId))].length;
    
    // Group by date
    const dailyAttendance: any = {};
    attendanceRecords.forEach((record: any) => {
      const date = record.checkedInAt.split('T')[0];
      dailyAttendance[date] = (dailyAttendance[date] || 0) + 1;
    });
    
    const analytics = {
      totalCheckIns,
      uniqueUsers,
      dailyAttendance,
      generatedAt: new Date().toISOString()
    };
    
    return {
      success: true,
      analytics
    };
  } catch (error: any) {
    console.error('Get attendance analytics error:', error);
    return { success: false, error: error.message || 'Failed to get attendance analytics' };
  }
}

// Export data
export async function exportData(exportType: string, filters: any, currentUser: AuthenticatedUser): Promise<{ success: boolean; message?: string; error?: string; data?: any; fileName?: string }> {
  try {
    // Only admins can export data
    if (!['admin', 'super-admin', 'chaplain'].includes(currentUser.role)) {
      return { success: false, error: 'Insufficient permissions' };
    }
    
    let data: any[] = [];
    let fileName = '';
    
    switch (exportType) {
      case 'users':
        const usersSnapshot = await db.collection('users').get();
        data = usersSnapshot.docs.map((doc: any) => ({
          id: doc.id,
          ...doc.data()
        }));
        fileName = `users-export-${new Date().toISOString().split('T')[0]}.json`;
        break;
        
      case 'attendance':
        let attendanceQuery: any = db.collection('attendance');
        
        if (filters.startDate) {
          attendanceQuery = attendanceQuery.where('checkedInAt', '>=', filters.startDate);
        }
        
        if (filters.endDate) {
          attendanceQuery = attendanceQuery.where('checkedInAt', '<=', filters.endDate);
        }
        
        const attendanceSnapshot = await attendanceQuery.get();
        data = attendanceSnapshot.docs.map((doc: any) => ({
          id: doc.id,
          ...doc.data()
        }));
        fileName = `attendance-export-${new Date().toISOString().split('T')[0]}.json`;
        break;
        
      case 'prayer-requests':
        const prayerRequestsSnapshot = await db.collection('prayerRequests').get();
        data = prayerRequestsSnapshot.docs.map((doc: any) => ({
          id: doc.id,
          ...doc.data()
        }));
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
  } catch (error: any) {
    console.error('Export data error:', error);
    return { success: false, error: error.message || 'Failed to export data' };
  }
}

// Get audit logs
export async function getAuditLogs(filters: any, currentUser: AuthenticatedUser): Promise<{ success: boolean; message?: string; error?: string; auditLogs?: any[]; total?: number }> {
  try {
    // Only admins can access audit logs
    if (!['admin', 'super-admin', 'chaplain'].includes(currentUser.role)) {
      return { success: false, error: 'Insufficient permissions' };
    }
    
    // Build query based on filters
    let query: any = db.collection('auditLogs');
    
    if (filters.action) {
      query = query.where('action', '==', filters.action);
    }
    
    if (filters.actorId) {
      query = query.where('actorId', '==', filters.actorId);
    }
    
    // Order by timestamp
    query = query.orderBy('timestamp', 'desc');
    
    // Apply pagination
    const page = filters.page || 1;
    const limit = filters.limit || 10;
    const offset = (page - 1) * limit;
    
    query = query.limit(limit).offset(offset);
    
    // Get audit logs
    const auditLogsSnapshot = await query.get();
    
    const auditLogs = auditLogsSnapshot.docs.map((doc: any) => ({
      id: doc.id,
      ...doc.data()
    }));
    
    // Get total count
    const totalSnapshot = await db.collection('auditLogs').get();
    const total = totalSnapshot.size;
    
    return {
      success: true,
      auditLogs,
      total
    };
  } catch (error: any) {
    console.error('Get audit logs error:', error);
    return { success: false, error: error.message || 'Failed to get audit logs' };
  }
}