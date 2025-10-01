import { Timestamp } from 'firebase/firestore';
import { getFirebaseAdmin } from '../../lib/firebase-admin';
import { BaseService } from './base.service';
import { AuditService } from './audit.service';

/**
 * Admin Service extending BaseService
 * Handles admin analytics, reporting, and system management
 */
export class AdminService extends BaseService<any> {
  private auditService: AuditService;

  constructor() {
    super('admin');
    this.auditService = new AuditService();
  }

  /**
   * Get dashboard statistics
   * @returns Dashboard statistics
   */
  async getDashboardStats(userId: string, ipAddress: string = 'unknown'): Promise<{ success: boolean; stats?: any; message?: string }> {
    try {
      const { db } = getFirebaseAdmin();
      
      // Get user count
      const usersSnapshot = await db.collection('users').get();
      const userCount = usersSnapshot.size;
      
      // Get active users (logged in within last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const activeUsersQuery = await db.collection('users')
        .where('lastLoginAt', '>=', thirtyDaysAgo.toISOString())
        .get();
      const activeUserCount = activeUsersQuery.size;
      
      // Get attendance count for last 7 days
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      const attendanceQuery = await db.collection('attendance')
        .where('timestamp', '>=', sevenDaysAgo.toISOString())
        .get();
      const attendanceCount = attendanceQuery.size;
      
      // Get prayer requests count
      const prayerRequestsSnapshot = await db.collection('prayerRequests').get();
      const prayerRequestCount = prayerRequestsSnapshot.size;
      
      // Get welfare support requests count
      const welfareSupportSnapshot = await db.collection('welfareSupport').get();
      const welfareSupportCount = welfareSupportSnapshot.size;
      
      const stats = {
        users: {
          total: userCount,
          active: activeUserCount,
          growth: 0 // Would need historical data to calculate
        },
        attendance: {
          last7Days: attendanceCount,
          averageDaily: Math.round(attendanceCount / 7)
        },
        engagement: {
          prayerRequests: prayerRequestCount,
          welfareSupport: welfareSupportCount
        },
        system: {
          health: 'good', // Would check actual system health in real implementation
          lastUpdated: new Date().toISOString()
        }
      };
      
      // Log audit action
      await this.auditService.logAdminAction('GET_DASHBOARD_STATS', userId, 'dashboard', {}, ipAddress);
      
      return { 
        success: true, 
        stats 
      };
    } catch (error) {
      console.error('Get dashboard stats error:', error);
      return { 
        success: false, 
        message: 'Failed to get dashboard statistics' 
      };
    }
  }

  /**
   * Get user analytics
   * @param dateRange Date range
   * @returns User analytics
   */
  async getUserAnalytics(
    dateRange: { start: string; end: string },
    userId: string,
    ipAddress: string = 'unknown'
  ): Promise<{ success: boolean; analytics?: any; message?: string }> {
    try {
      const { db } = getFirebaseAdmin();
      
      // Get new user registrations
      const newUserQuery = await db.collection('users')
        .where('createdAt', '>=', dateRange.start)
        .where('createdAt', '<=', dateRange.end)
        .get();
      
      const newUsers: any[] = [];
      newUserQuery.forEach((doc: any) => {
        newUsers.push({ id: doc.id, ...(doc.data() as any) });
      });
      
      // Get user activity
      const activeUserQuery = await db.collection('users')
        .where('lastLoginAt', '>=', dateRange.start)
        .where('lastLoginAt', '<=', dateRange.end)
        .get();
      
      const activeUsers: any[] = [];
      activeUserQuery.forEach((doc: any) => {
        activeUsers.push({ id: doc.id, ...(doc.data() as any) });
      });
      
      // Group by role
      const usersByRole: Record<string, number> = {};
      newUsers.forEach(user => {
        const role = user.role || 'member';
        usersByRole[role] = (usersByRole[role] || 0) + 1;
      });
      
      // Group by date
      const usersByDate: Record<string, number> = {};
      newUsers.forEach(user => {
        const date = user.createdAt.split('T')[0];
        usersByDate[date] = (usersByDate[date] || 0) + 1;
      });
      
      const analytics = {
        newUserCount: newUsers.length,
        activeUserCount: activeUsers.length,
        usersByRole,
        usersByDate,
        retentionRate: 0 // Would need historical data to calculate
      };
      
      // Log audit action
      await this.auditService.logAdminAction('GET_USER_ANALYTICS', userId, 'users', { dateRange }, ipAddress);
      
      return { 
        success: true, 
        analytics 
      };
    } catch (error) {
      console.error('Get user analytics error:', error);
      return { 
        success: false, 
        message: 'Failed to get user analytics' 
      };
    }
  }

  /**
   * Get attendance analytics
   * @param dateRange Date range
   * @returns Attendance analytics
   */
  async getAttendanceAnalytics(
    dateRange: { start: string; end: string },
    userId: string,
    ipAddress: string = 'unknown'
  ): Promise<{ success: boolean; analytics?: any; message?: string }> {
    try {
      const { db } = getFirebaseAdmin();
      
      // Get attendance records
      const attendanceQuery = await db.collection('attendance')
        .where('timestamp', '>=', dateRange.start)
        .where('timestamp', '<=', dateRange.end)
        .get();
      
      const attendanceRecords: any[] = [];
      attendanceQuery.forEach((doc: any) => {
        attendanceRecords.push({ id: doc.id, ...(doc.data() as any) });
      });
      
      // Group by date
      const attendanceByDate: Record<string, number> = {};
      attendanceRecords.forEach(record => {
        const date = record.timestamp.split('T')[0];
        attendanceByDate[date] = (attendanceByDate[date] || 0) + 1;
      });
      
      // Group by method
      const attendanceByMethod: Record<string, number> = {};
      attendanceRecords.forEach(record => {
        const method = record.method || 'unknown';
        attendanceByMethod[method] = (attendanceByMethod[method] || 0) + 1;
      });
      
      // Get unique attendees
      const uniqueAttendees = new Set(attendanceRecords.map(record => record.userId)).size;
      
      const analytics = {
        totalAttendance: attendanceRecords.length,
        uniqueAttendees,
        averageDaily: Math.round(attendanceRecords.length / Object.keys(attendanceByDate).length),
        attendanceByDate,
        attendanceByMethod,
        peakAttendanceDate: Object.keys(attendanceByDate).reduce((a, b) => 
          attendanceByDate[a] > attendanceByDate[b] ? a : b, 
          Object.keys(attendanceByDate)[0]
        )
      };
      
      // Log audit action
      await this.auditService.logAdminAction('GET_ATTENDANCE_ANALYTICS', userId, 'attendance', { dateRange }, ipAddress);
      
      return { 
        success: true, 
        analytics 
      };
    } catch (error) {
      console.error('Get attendance analytics error:', error);
      return { 
        success: false, 
        message: 'Failed to get attendance analytics' 
      };
    }
  }

  /**
   * Get prayer analytics
   * @param dateRange Date range
   * @returns Prayer analytics
   */
  async getPrayerAnalytics(
    dateRange: { start: string; end: string },
    userId: string,
    ipAddress: string = 'unknown'
  ): Promise<{ success: boolean; analytics?: any; message?: string }> {
    try {
      const { db } = getFirebaseAdmin();
      
      // Get prayer requests
      const prayerQuery = await db.collection('prayerRequests')
        .where('createdAt', '>=', dateRange.start)
        .where('createdAt', '<=', dateRange.end)
        .get();
      
      const prayerRequests: any[] = [];
      prayerQuery.forEach((doc: any) => {
        prayerRequests.push({ id: doc.id, ...(doc.data() as any) });
      });
      
      // Group by status
      const prayersByStatus: Record<string, number> = {};
      prayerRequests.forEach(request => {
        const status = request.status || 'pending';
        prayersByStatus[status] = (prayersByStatus[status] || 0) + 1;
      });
      
      // Group by date
      const prayersByDate: Record<string, number> = {};
      prayerRequests.forEach(request => {
        const date = request.createdAt.split('T')[0];
        prayersByDate[date] = (prayersByDate[date] || 0) + 1;
      });
      
      // Get anonymous vs public prayers
      const anonymousPrayers = prayerRequests.filter(request => request.isAnonymous).length;
      const publicPrayers = prayerRequests.filter(request => !request.isAnonymous).length;
      
      const analytics = {
        totalPrayers: prayerRequests.length,
        prayersByStatus,
        prayersByDate,
        anonymousPrayers,
        publicPrayers,
        mostCommonCategory: '' // Would need category data to calculate
      };
      
      // Log audit action
      await this.auditService.logAdminAction('GET_PRAYER_ANALYTICS', userId, 'prayer', { dateRange }, ipAddress);
      
      return { 
        success: true, 
        analytics 
      };
    } catch (error) {
      console.error('Get prayer analytics error:', error);
      return { 
        success: false, 
        message: 'Failed to get prayer analytics' 
      };
    }
  }

  /**
   * Export data
   * @param collection Collection name
   * @param format Export format
   * @param filters Filters to apply
   * @returns Exported data
   */
  async exportData(
    collection: string,
    format: 'csv' | 'json',
    filters: Record<string, any> = {},
    userId: string,
    ipAddress: string = 'unknown'
  ): Promise<{ success: boolean; data?: string; message?: string }> {
    try {
      const { db } = getFirebaseAdmin();
      
      let query: any = db.collection(collection);
      
      // Apply filters
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          query = query.where(key, '==', value);
        }
      });
      
      const querySnapshot = await query.get();
      const data: any[] = [];
      
      querySnapshot.forEach((doc: any) => {
        data.push({ id: doc.id, ...(doc.data() as any) });
      });
      
      let exportData: string;
      
      if (format === 'json') {
        exportData = JSON.stringify(data, null, 2);
      } else {
        // CSV format
        if (data.length === 0) {
          exportData = '';
        } else {
          const headers = Object.keys(data[0]);
          const rows = data.map(item => 
            headers.map(header => 
              typeof item[header] === 'object' 
                ? JSON.stringify(item[header]) 
                : String(item[header] || '')
            )
          );
          
          exportData = [
            headers.join(','),
            ...rows.map(row => row.join(','))
          ].join('\n');
        }
      }
      
      // Log audit action
      await this.auditService.logAdminAction('EXPORT_DATA', userId, collection, { format, filters }, ipAddress);
      
      return { 
        success: true, 
        data: exportData 
      };
    } catch (error) {
      console.error('Export data error:', error);
      return { 
        success: false, 
        message: 'Failed to export data' 
      };
    }
  }

  /**
   * Get audit logs
   * @param filters Filters to apply
   * @param pagination Pagination parameters
   * @returns Audit logs
   */
  async getAuditLogs(
    filters: { action?: string; userId?: string } = {},
    pagination: { limit?: number; lastDoc?: any } = {},
    userId: string,
    ipAddress: string = 'unknown'
  ): Promise<{ success: boolean; logs?: any[]; lastDoc?: any; message?: string }> {
    try {
      const result = await this.auditService.getAuditLogs(filters, pagination.limit, pagination.lastDoc);
      
      // Log audit action
      await this.auditService.logAdminAction('GET_AUDIT_LOGS', userId, 'audit', { filters, pagination }, ipAddress);
      
      return { 
        success: true, 
        logs: result.logs,
        lastDoc: result.lastDoc
      };
    } catch (error) {
      console.error('Get audit logs error:', error);
      return { 
        success: false, 
        message: 'Failed to get audit logs' 
      };
    }
  }

  /**
   * Get system health metrics
   * @returns System health metrics
   */
  async getSystemHealth(userId: string, ipAddress: string = 'unknown'): Promise<{ success: boolean; health?: any; message?: string }> {
    try {
      // In a real implementation, you would check actual system metrics
      // For now, we'll return simulated health data
      
      const health = {
        status: 'healthy',
        uptime: process.uptime(),
        memory: {
          used: process.memoryUsage().heapUsed,
          total: process.memoryUsage().heapTotal,
          percentage: Math.round((process.memoryUsage().heapUsed / process.memoryUsage().heapTotal) * 100)
        },
        database: {
          status: 'connected',
          latency: Math.random() * 100 // Simulated latency
        },
        api: {
          status: 'operational',
          responseTime: Math.random() * 200 // Simulated response time
        },
        lastChecked: new Date().toISOString()
      };
      
      // Log audit action
      await this.auditService.logAdminAction('GET_SYSTEM_HEALTH', userId, 'system', {}, ipAddress);
      
      return { 
        success: true, 
        health 
      };
    } catch (error) {
      console.error('Get system health error:', error);
      return { 
        success: false, 
        message: 'Failed to get system health metrics' 
      };
    }
  }
}