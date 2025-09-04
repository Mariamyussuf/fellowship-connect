import { 
  collection, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit,
  doc,
  updateDoc,
  deleteDoc
} from 'firebase/firestore';
import { db } from '../firebase/config';
import type { 
  FellowshipUser, 
  AttendanceRecord, 
  PrayerRequest,
  WelfareRequest,
  EvangelismReport,
  QRCodeSession
} from '../types';

/**
 * Service for admin operations including member management, reporting, and system oversight
 */

export class AdminService {
  private static instance: AdminService;
  
  public static getInstance(): AdminService {
    if (!AdminService.instance) {
      AdminService.instance = new AdminService();
    }
    return AdminService.instance;
  }

  // Member Management
  async getAllMembers(options: {
    role?: string;
    status?: string;
    campus?: string;
    limit?: number;
    orderBy?: 'name' | 'joinDate' | 'lastActive';
    direction?: 'asc' | 'desc';
  } = {}): Promise<FellowshipUser[]> {
    try {
      let baseQuery = query(collection(db, 'users'));
      const constraints: any[] = [];

      if (options.role) {
        constraints.push(where('role', '==', options.role));
      }

      if (options.status) {
        constraints.push(where('status', '==', options.status));
      }

      if (options.campus) {
        constraints.push(where('campus', '==', options.campus));
      }

      if (options.orderBy) {
        const orderField = options.orderBy === 'name' ? 'fullName' : 
                          options.orderBy === 'joinDate' ? 'createdAt' : 'lastLoginAt';
        constraints.push(orderBy(orderField, options.direction || 'asc'));
      }

      if (options.limit) {
        constraints.push(limit(options.limit));
      }

      const finalQuery = constraints.length > 0 ? 
        query(collection(db, 'users'), ...constraints) : baseQuery;

      const snapshot = await getDocs(finalQuery);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as FellowshipUser));

    } catch (error) {
      console.error('Error getting members:', error);
      throw error;
    }
  }

  async updateMemberRole(userId: string, newRole: 'member' | 'admin' | 'super-admin'): Promise<void> {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        role: newRole,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error updating member role:', error);
      throw error;
    }
  }

  async updateMemberStatus(userId: string, status: 'active' | 'inactive' | 'suspended'): Promise<void> {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        status: status,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error updating member status:', error);
      throw error;
    }
  }

  async deleteMember(userId: string): Promise<void> {
    try {
      const userRef = doc(db, 'users', userId);
      await deleteDoc(userRef);
    } catch (error) {
      console.error('Error deleting member:', error);
      throw error;
    }
  }

  // Attendance Reports
  async getAttendanceReport(options: {
    startDate?: string;
    endDate?: string;
    eventType?: string;
    campus?: string;
  } = {}) {
    try {
      let baseQuery = query(collection(db, 'attendance'));
      const constraints: any[] = [];

      if (options.startDate) {
        constraints.push(where('timestamp', '>=', options.startDate));
      }

      if (options.endDate) {
        constraints.push(where('timestamp', '<=', options.endDate));
      }

      if (options.eventType) {
        constraints.push(where('eventType', '==', options.eventType));
      }

      if (options.campus) {
        constraints.push(where('campus', '==', options.campus));
      }

      constraints.push(orderBy('timestamp', 'desc'));

      const finalQuery = constraints.length > 0 ? 
        query(collection(db, 'attendance'), ...constraints) : baseQuery;

      const snapshot = await getDocs(finalQuery);
      const records = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as AttendanceRecord));

      // Calculate statistics
      const totalAttendance = records.length;
      const uniqueAttendees = new Set(records.map(r => r.userId)).size;
      const averagePerEvent = records.length > 0 ? 
        totalAttendance / new Set(records.map(r => r.eventId)).size : 0;

      const attendanceByDate = records.reduce((acc, record) => {
        const date = record.timestamp.split('T')[0];
        acc[date] = (acc[date] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const attendanceByMethod = records.reduce((acc, record) => {
        acc[record.checkInMethod] = (acc[record.checkInMethod] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      return {
        records,
        statistics: {
          totalAttendance,
          uniqueAttendees,
          averagePerEvent: Math.round(averagePerEvent * 100) / 100,
          attendanceByDate,
          attendanceByMethod
        }
      };

    } catch (error) {
      console.error('Error getting attendance report:', error);
      throw error;
    }
  }

  // Prayer Request Management
  async getPrayerRequestsForModeration(): Promise<PrayerRequest[]> {
    try {
      const q = query(
        collection(db, 'prayerRequests'),
        where('status', '==', 'pending'),
        orderBy('createdAt', 'desc')
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as PrayerRequest));

    } catch (error) {
      console.error('Error getting prayer requests for moderation:', error);
      throw error;
    }
  }

  async moderatePrayerRequest(requestId: string, action: 'approve' | 'reject', adminNotes?: string): Promise<void> {
    try {
      const requestRef = doc(db, 'prayerRequests', requestId);
      await updateDoc(requestRef, {
        status: action === 'approve' ? 'approved' : 'rejected',
        adminNotes: adminNotes || '',
        moderatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error moderating prayer request:', error);
      throw error;
    }
  }

  // Welfare Request Management
  async getWelfareRequestsForReview(): Promise<WelfareRequest[]> {
    try {
      const q = query(
        collection(db, 'welfareRequests'),
        where('status', 'in', ['pending', 'reviewed']),
        orderBy('urgency', 'desc'),
        orderBy('createdAt', 'asc')
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as WelfareRequest));

    } catch (error) {
      console.error('Error getting welfare requests for review:', error);
      throw error;
    }
  }

  async updateWelfareRequestStatus(
    requestId: string, 
    status: 'reviewed' | 'approved' | 'completed' | 'declined',
    adminNotes?: string,
    assignedTo?: string
  ): Promise<void> {
    try {
      const requestRef = doc(db, 'welfareRequests', requestId);
      const updateData: any = {
        status,
        updatedAt: new Date().toISOString()
      };

      if (adminNotes) {
        updateData.adminNotes = adminNotes;
      }

      if (assignedTo) {
        updateData.assignedTo = assignedTo;
        updateData.assignedAt = new Date().toISOString();
      }

      if (status === 'completed') {
        updateData.resolvedAt = new Date().toISOString();
      }

      await updateDoc(requestRef, updateData);
    } catch (error) {
      console.error('Error updating welfare request status:', error);
      throw error;
    }
  }

  // Evangelism Report Management
  async getEvangelismReportsForModeration(): Promise<EvangelismReport[]> {
    try {
      const q = query(
        collection(db, 'evangelismReports'),
        where('status', '==', 'pending'),
        orderBy('createdAt', 'desc')
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as EvangelismReport));

    } catch (error) {
      console.error('Error getting evangelism reports for moderation:', error);
      throw error;
    }
  }

  async moderateEvangelismReport(
    reportId: string, 
    action: 'approve' | 'reject', 
    featured: boolean = false,
    adminNotes?: string
  ): Promise<void> {
    try {
      const reportRef = doc(db, 'evangelismReports', reportId);
      await updateDoc(reportRef, {
        status: action === 'approve' ? 'approved' : 'rejected',
        featured: action === 'approve' ? featured : false,
        adminNotes: adminNotes || '',
        moderatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error moderating evangelism report:', error);
      throw error;
    }
  }

  // System Statistics
  async getSystemStats() {
    try {
      const [
        membersSnapshot,
        attendanceSnapshot,
        prayerRequestsSnapshot,
        welfareRequestsSnapshot,
        evangelismReportsSnapshot
      ] = await Promise.all([
        getDocs(collection(db, 'users')),
        getDocs(query(collection(db, 'attendance'), limit(1000))),
        getDocs(collection(db, 'prayerRequests')),
        getDocs(collection(db, 'welfareRequests')),
        getDocs(collection(db, 'evangelismReports'))
      ]);

      const members = membersSnapshot.docs.map(doc => doc.data() as FellowshipUser);
      const attendance = attendanceSnapshot.docs.map(doc => doc.data() as AttendanceRecord);

      // Member statistics
      const membersByRole = members.reduce((acc, member) => {
        acc[member.role] = (acc[member.role] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const membersByStatus = members.reduce((acc, member) => {
        const status = member.status || 'active';
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const membersByCampus = members.reduce((acc, member) => {
        const campus = member.campus || 'main';
        acc[campus] = (acc[campus] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      // Recent activity (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const recentAttendance = attendance.filter(record => 
        new Date(record.timestamp) >= thirtyDaysAgo
      );

      return {
        members: {
          total: members.length,
          byRole: membersByRole,
          byStatus: membersByStatus,
          byCampus: membersByCampus,
          newThisMonth: members.filter(m => 
            new Date(m.createdAt || '') >= thirtyDaysAgo
          ).length
        },
        attendance: {
          total: attendance.length,
          recentTotal: recentAttendance.length,
          uniqueRecentAttendees: new Set(recentAttendance.map(r => r.userId)).size,
          averageWeekly: Math.round(recentAttendance.length / 4 * 100) / 100
        },
        engagement: {
          prayerRequests: prayerRequestsSnapshot.size,
          welfareRequests: welfareRequestsSnapshot.size,
          evangelismReports: evangelismReportsSnapshot.size
        }
      };

    } catch (error) {
      console.error('Error getting system stats:', error);
      throw error;
    }
  }

  // QR Code Session Management
  async getActiveQRSessions(): Promise<QRCodeSession[]> {
    try {
      const q = query(
        collection(db, 'qrCodeSessions'),
        where('isActive', '==', true),
        orderBy('createdAt', 'desc')
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as QRCodeSession));

    } catch (error) {
      console.error('Error getting active QR sessions:', error);
      throw error;
    }
  }

  async deactivateQRSession(sessionId: string): Promise<void> {
    try {
      const sessionRef = doc(db, 'qrCodeSessions', sessionId);
      await updateDoc(sessionRef, {
        isActive: false,
        deactivatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error deactivating QR session:', error);
      throw error;
    }
  }

  // Export functionality
  async exportMemberData(format: 'csv' | 'json' = 'csv'): Promise<string> {
    try {
      const members = await this.getAllMembers();
      
      if (format === 'json') {
        return JSON.stringify(members, null, 2);
      }

      // CSV format
      const headers = [
        'ID', 'Full Name', 'Email', 'Phone', 'Role', 'Status', 
        'Campus', 'Join Date', 'Last Login'
      ];
      
      const csvRows = [
        headers.join(','),
        ...members.map(member => [
          member.id || '',
          `"${member.fullName || ''}"`,
          member.email || '',
          member.phoneNumber || '',
          member.role || '',
          member.status || 'active',
          member.campus || '',
          member.createdAt || '',
          member.lastLoginAt || ''
        ].join(','))
      ];

      return csvRows.join('\n');

    } catch (error) {
      console.error('Error exporting member data:', error);
      throw error;
    }
  }
}
