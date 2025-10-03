import { Timestamp } from 'firebase/firestore';
import { getFirebaseAdmin } from '../../lib/firebase-admin';
import { BaseService } from './base.service';
import { Attendance, QRCodeSession } from '../../types/database';
import { nanoid } from 'nanoid';
import type FirebaseFirestore from 'firebase-admin/firestore';

interface SessionReport {
  session: {
    id: string;
    [key: string]: unknown;
  };
  attendanceCount: number;
  attendanceRecords: Attendance[];
}

interface AttendanceStats {
  totalAttendance: number;
  uniqueMembers: number;
  byMethod: Record<string, number>;
  byDate: Record<string, number>;
}

/**
 * Attendance Service extending BaseService
 * Handles attendance management operations
 */
export class AttendanceService extends BaseService<Attendance> {
  constructor() {
    super('attendance');
  }

  /**
   * Create QR code session for an event
   * @param name Session name
   * @param location Session location
   * @param duration Session duration in minutes
   * @param createdBy User ID of creator
   * @param ipAddress IP address of the request (for audit logging)
   * @returns QR code session data
   */
  async createSession(
    name: string,
    location: string,
    duration: number,
    createdBy: string,
    ipAddress: string = 'unknown'
  ): Promise<{ success: boolean; session?: QRCodeSession; message?: string }> {
    try {
      const { db } = getFirebaseAdmin();
      
      // Calculate end time
      const startTime = new Date();
      const endTime = new Date(startTime.getTime() + duration * 60000);
      
      const sessionData: Omit<QRCodeSession, 'id'> = {
        name,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        location,
        createdBy,
        isActive: true,
        qrCodeData: `${name}-${nanoid(8)}-${Date.now()}`
      };
      
      // Save session to Firestore
      const docRef = await db.collection('qrCodeSessions').add({
        ...sessionData,
        createdAt: Timestamp.now()
      });
      
      const session: QRCodeSession = { 
        ...sessionData,
        id: docRef.id
      };
      
      // Log audit action
      await this.logAudit('CREATE_SESSION', docRef.id, { ...sessionData, ipAddress });
      
      return { 
        success: true, 
        session
      };
    } catch (error) {
      console.error('Create session error:', error);
      return { 
        success: false, 
        message: 'Failed to create session' 
      };
    }
  }

  /**
   * Generate QR code for a session
   * @param sessionId Session ID
   * @param ipAddress IP address of the request (for audit logging)
   * @returns QR code data
   */
  async generateQRCode(
    sessionId: string,
    ipAddress: string = 'unknown'
  ): Promise<{ success: boolean; qrCodeData?: string; message?: string }> {
    try {
      const { db } = getFirebaseAdmin();
      
      const sessionDoc = await db.collection('qrCodeSessions').doc(sessionId).get();
      
      if (!sessionDoc.exists) {
        return { 
          success: false, 
          message: 'Session not found' 
        };
      }
      
      const sessionData = sessionDoc.data() as QRCodeSession;
      
      // Check if session is active
      if (!sessionData.isActive) {
        return { 
          success: false, 
          message: 'Session is not active' 
        };
      }
      
      // Check if session has expired
      const endTime = new Date(sessionData.endTime);
      if (endTime < new Date()) {
        return { 
          success: false, 
          message: 'Session has expired' 
        };
      }
      
      // Log audit action
      await this.logAudit('GENERATE_QR', sessionId, { ipAddress });
      
      return { 
        success: true, 
        qrCodeData: sessionData.qrCodeData 
      };
    } catch (error) {
      console.error('Generate QR code error:', error);
      return { 
        success: false, 
        message: 'Failed to generate QR code' 
      };
    }
  }

  /**
   * Validate QR code
   * @param qrData QR code data
   * @param ipAddress IP address of the request (for audit logging)
   * @returns Validation result
   */
  async validateQRCode(
    qrData: string,
    ipAddress: string = 'unknown'
  ): Promise<{ success: boolean; sessionId?: string; message?: string }> {
    try {
      const { db } = getFirebaseAdmin();
      
      // Find session with matching QR code data
      const sessionQuery = await db.collection('qrCodeSessions')
        .where('qrCodeData', '==', qrData)
        .where('isActive', '==', true)
        .get();
      
      if (sessionQuery.empty) {
        return { 
          success: false, 
          message: 'Invalid QR code' 
        };
      }
      
      const sessionDoc = sessionQuery.docs[0];
      const sessionData = sessionDoc.data() as QRCodeSession;
      
      // Check if session has expired
      const endTime = new Date(sessionData.endTime);
      if (endTime < new Date()) {
        // Deactivate expired session
        await db.collection('qrCodeSessions').doc(sessionDoc.id).update({
          isActive: false,
          updatedAt: Timestamp.now()
        });
        
        return { 
          success: false, 
          message: 'Session has expired' 
        };
      }
      
      // Log audit action
      await this.logAudit('VALIDATE_QR', sessionDoc.id, { qrData, ipAddress });
      
      return { 
        success: true, 
        sessionId: sessionDoc.id 
      };
    } catch (error) {
      console.error('Validate QR code error:', error);
      return { 
        success: false, 
        message: 'Failed to validate QR code' 
      };
    }
  }

  /**
   * Check in user to a session
   * @param userId User ID
   * @param sessionId Session ID
   * @param method Check-in method
   * @param ipAddress IP address of the request (for audit logging)
   * @returns Check-in result
   */
  async checkIn(
    userId: string,
    sessionId: string,
    method: 'qr' | 'manual' | 'admin' | 'offline',
    ipAddress: string = 'unknown'
  ): Promise<{ success: boolean; attendanceId?: string; message?: string }> {
    try {
      const { db } = getFirebaseAdmin();
      
      // Check if user already checked in for this session
      const existingAttendanceQuery = await db.collection('attendance')
        .where('userId', '==', userId)
        .where('sessionId', '==', sessionId)
        .get();
      
      if (!existingAttendanceQuery.empty) {
        return { 
          success: false, 
          message: 'User already checked in for this session' 
        };
      }
      
      // Get session details
      const sessionDoc = await db.collection('qrCodeSessions').doc(sessionId).get();
      
      if (!sessionDoc.exists) {
        return { 
          success: false, 
          message: 'Session not found' 
        };
      }
      
      const sessionData = sessionDoc.data() as QRCodeSession;
      
      // Check if session is active
      if (!sessionData.isActive) {
        return { 
          success: false, 
          message: 'Session is not active' 
        };
      }
      
      // Check if session has expired
      const endTime = new Date(sessionData.endTime);
      if (endTime < new Date()) {
        return { 
          success: false, 
          message: 'Session has expired' 
        };
      }
      
      // Create attendance record
      const attendanceData: Omit<Attendance, 'id' | 'createdAt'> = {
        userId,
        sessionId,
        timestamp: new Date().toISOString(),
        location: sessionData.location,
        method
      };
      
      const docRef = await db.collection('attendance').add({
        ...attendanceData,
        createdAt: Timestamp.now()
      });
      
      // Update session attendance count
      await db.collection('qrCodeSessions').doc(sessionId).update({
        updatedAt: Timestamp.now()
      });
      
      // Log audit action
      await this.logAudit('CHECK_IN', docRef.id, { ...attendanceData, ipAddress });
      
      return { 
        success: true, 
        attendanceId: docRef.id 
      };
    } catch (error) {
      console.error('Check-in error:', error);
      return { 
        success: false, 
        message: 'Failed to check in' 
      };
    }
  }

  /**
   * Close a session
   * @param sessionId Session ID
   * @param ipAddress IP address of the request (for audit logging)
   * @returns Success status
   */
  async closeSession(
    sessionId: string,
    ipAddress: string = 'unknown'
  ): Promise<{ success: boolean; message?: string }> {
    try {
      const { db } = getFirebaseAdmin();
      
      await db.collection('qrCodeSessions').doc(sessionId).update({
        isActive: false,
        updatedAt: Timestamp.now()
      });
      
      // Log audit action
      await this.logAudit('CLOSE_SESSION', sessionId, { ipAddress });
      
      return { 
        success: true, 
        message: 'Session closed successfully' 
      };
    } catch (error) {
      console.error('Close session error:', error);
      return { 
        success: false, 
        message: 'Failed to close session' 
      };
    }
  }

  /**
   * Sync offline attendance records
   * @param records Offline attendance records
   * @param ipAddress IP address of the request (for audit logging)
   * @returns Sync result
   */
  async syncOfflineAttendance(
    records: Array<{ userId: string; sessionId: string; timestamp: string }>,
    ipAddress: string = 'unknown'
  ): Promise<{ success: boolean; syncedCount?: number; message?: string }> {
    try {
      const { db } = getFirebaseAdmin();
      let syncedCount = 0;
      
      for (const record of records) {
        // Check if record already exists
        const existingQuery = await db.collection('attendance')
          .where('userId', '==', record.userId)
          .where('sessionId', '==', record.sessionId)
          .where('timestamp', '==', record.timestamp)
          .get();
        
        if (existingQuery.empty) {
          // Create attendance record
          await db.collection('attendance').add({
            ...record,
            method: 'offline',
            createdAt: Timestamp.now()
          });
          
          syncedCount++;
        }
      }
      
      // Log audit action
      await this.logAudit('SYNC_OFFLINE', 'system', { count: syncedCount, ipAddress });
      
      return { 
        success: true, 
        syncedCount 
      };
    } catch (error) {
      console.error('Sync offline attendance error:', error);
      return { 
        success: false, 
        message: 'Failed to sync offline attendance' 
      };
    }
  }

  /**
   * Get session report
   * @param sessionId Session ID
   * @param ipAddress IP address of the request (for audit logging)
   * @returns Session report
   */
  async getSessionReport(
    sessionId: string,
    ipAddress: string = 'unknown'
  ): Promise<{ success: boolean; report?: SessionReport; message?: string }> {
    try {
      const { db } = getFirebaseAdmin();
      
      // Get session details
      const sessionDoc = await db.collection('qrCodeSessions').doc(sessionId).get();
      
      if (!sessionDoc.exists) {
        return { 
          success: false, 
          message: 'Session not found' 
        };
      }
      
      const sessionData = sessionDoc.data() as QRCodeSession;
      
      // Get attendance records for session
      const attendanceQuery = await db.collection('attendance')
        .where('sessionId', '==', sessionId)
        .get();
      
      const attendanceRecords: Attendance[] = [];
      attendanceQuery.forEach((doc: FirebaseFirestore.QueryDocumentSnapshot) => {
        const data = doc.data() as Attendance;
        attendanceRecords.push({
          ...data,
          id: doc.id
        });
      });
      
      const report: SessionReport = {
        session: { id: sessionDoc.id, ...sessionData },
        attendanceCount: attendanceRecords.length,
        attendanceRecords
      };
      
      // Log audit action
      await this.logAudit('GET_SESSION_REPORT', sessionId, { ipAddress });
      
      return { 
        success: true, 
        report 
      };
    } catch (error) {
      console.error('Get session report error:', error);
      return { 
        success: false, 
        message: 'Failed to generate session report' 
      };
    }
  }

  /**
   * Get attendance statistics
   * @param userId User ID (optional)
   * @param dateRange Date range
   * @param ipAddress IP address of the request (for audit logging)
   * @returns Attendance statistics
   */
  async getAttendanceStats(
    userId: string | undefined,
    dateRange: { start: string; end: string },
    ipAddress: string = 'unknown'
  ): Promise<{ success: boolean; stats?: AttendanceStats; message?: string }> {
    try {
      const { db } = getFirebaseAdmin();
      
      let query: FirebaseFirestore.Query = db.collection('attendance');
      
      // Apply user filter if provided
      if (userId) {
        query = query.where('userId', '==', userId);
      }
      
      // Apply date range filter
      query = query
        .where('timestamp', '>=', dateRange.start)
        .where('timestamp', '<=', dateRange.end);
      
      const querySnapshot = await query.get();
      
      const attendanceRecords: Attendance[] = [];
      querySnapshot.forEach((doc: FirebaseFirestore.QueryDocumentSnapshot) => {
        const data = doc.data() as Attendance;
        attendanceRecords.push({
          ...data,
          id: doc.id
        });
      });
      
      // Calculate statistics
      const stats: AttendanceStats = {
        totalAttendance: attendanceRecords.length,
        uniqueMembers: new Set(attendanceRecords.map(r => r.userId)).size,
        byMethod: attendanceRecords.reduce((acc: Record<string, number>, record) => {
          const method = record.method || 'unknown';
          acc[method] = (acc[method] || 0) + 1;
          return acc;
        }, {}),
        byDate: attendanceRecords.reduce((acc: Record<string, number>, record) => {
          const date = new Date(record.timestamp).toISOString().split('T')[0];
          acc[date] = (acc[date] || 0) + 1;
          return acc;
        }, {})
      };
      
      // Log audit action
      await this.logAudit('GET_ATTENDANCE_STATS', userId || 'all', { dateRange, ipAddress });
      
      return { 
        success: true, 
        stats 
      };
    } catch (error) {
      console.error('Get attendance stats error:', error);
      return { 
        success: false, 
        message: 'Failed to get attendance statistics' 
      };
    }
  }

  /**
   * Export attendance data
   * @param sessionId Session ID
   * @param format Export format (csv, json)
   * @param ipAddress IP address of the request (for audit logging)
   * @returns Export data
   */
  async exportAttendance(
    sessionId: string,
    format: 'csv' | 'json',
    ipAddress: string = 'unknown'
  ): Promise<{ success: boolean; data?: string; message?: string }> {
    try {
      const { db } = getFirebaseAdmin();
      
      // Get session details
      const sessionDoc = await db.collection('qrCodeSessions').doc(sessionId).get();
      
      if (!sessionDoc.exists) {
        return { 
          success: false, 
          message: 'Session not found' 
        };
      }
      
      // Get attendance records for session
      const attendanceQuery = await db.collection('attendance')
        .where('sessionId', '==', sessionId)
        .get();
      
      const attendanceRecords: Attendance[] = [];
      attendanceQuery.forEach((doc: FirebaseFirestore.QueryDocumentSnapshot) => {
        const data = doc.data() as Attendance;
        attendanceRecords.push({
          ...data,
          id: doc.id
        });
      });
      
      let exportData: string;
      
      if (format === 'json') {
        exportData = JSON.stringify({
          session: { id: sessionDoc.id, ...(sessionDoc.data() as Record<string, unknown>) },
          attendance: attendanceRecords
        }, null, 2);
      } else {
        // CSV format
        const headers = ['ID', 'User ID', 'Session ID', 'Timestamp', 'Location', 'Method'];
        const rows = attendanceRecords.map(record => [
          record.id,
          record.userId,
          record.sessionId,
          record.timestamp,
          record.location,
          record.method
        ]);
        
        exportData = [
          headers.join(','),
          ...rows.map(row => row.join(','))
        ].join('\n');
      }
      
      // Log audit action
      await this.logAudit('EXPORT_ATTENDANCE', sessionId, { format, ipAddress });
      
      return { 
        success: true, 
        data: exportData 
      };
    } catch (error) {
      console.error('Export attendance error:', error);
      return { 
        success: false, 
        message: 'Failed to export attendance data' 
      };
    }
  }
}