import { 
  collection, 
  query, 
  where, 
  getDocs, 
  doc, 
  setDoc, 
  addDoc, 
  updateDoc, 
  orderBy, 
  limit,
  startAfter,
  Timestamp,
  getDoc
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import type { AttendanceRecord, OfflineAttendanceRecord, QRCodeSession, VisitorInfo } from '../types';
import { generateQRCodeSession, generateWordOfTheDay, validateQRCodeSession, canUserCheckIn } from '@/utils/qrCodeUtils';

// Create a new attendance record
export const createAttendanceRecord = async (record: Omit<AttendanceRecord, 'id' | 'createdAt'>) => {
  try {
    const docRef = await addDoc(collection(db, 'attendance'), {
      ...record,
      createdAt: Timestamp.now(),
    });
    return { id: docRef.id, ...record, createdAt: Timestamp.now() };
  } catch (error) {
    console.error('Error creating attendance record:', error);
    throw error;
  }
};

// Get attendance records for a specific event
export const getAttendanceByEvent = async (eventId: string) => {
  try {
    const q = query(
      collection(db, 'attendance'),
      where('eventId', '==', eventId),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AttendanceRecord));
  } catch (error) {
    console.error('Error fetching attendance records:', error);
    throw error;
  }
};

// Get recent attendance records for a user with pagination
export const getUserAttendance = async (userId: string, lastDoc: any = null, pageSize = 10) => {
  try {
    let q = query(
      collection(db, 'attendance'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(pageSize)
    );

    if (lastDoc) {
      q = query(q, startAfter(lastDoc));
    }

    const querySnapshot = await getDocs(q);
    const records = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AttendanceRecord));
    return { records, lastDoc: querySnapshot.docs[querySnapshot.docs.length - 1] };
  } catch (error) {
    console.error('Error fetching user attendance:', error);
    throw error;
  }
};

// Get all attendance records for admin with pagination
export const getAllAttendanceRecords = async (lastDoc: any = null, pageSize = 20) => {
  try {
    let q = query(
      collection(db, 'attendance'),
      orderBy('createdAt', 'desc'),
      limit(pageSize)
    );

    if (lastDoc) {
      q = query(q, startAfter(lastDoc));
    }

    const querySnapshot = await getDocs(q);
    const records = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AttendanceRecord));
    return { records, lastDoc: querySnapshot.docs[querySnapshot.docs.length - 1] };
  } catch (error) {
    console.error('Error fetching all attendance records:', error);
    throw error;
  }
};

// Save offline attendance record
export const saveOfflineAttendance = async (record: OfflineAttendanceRecord) => {
  try {
    // Store in offlineAttendance collection
    const docRef = await addDoc(collection(db, 'offlineAttendance'), {
      ...record,
      synced: false,
      createdAt: Timestamp.now(),
    });
    return { id: docRef.id, ...record, synced: false, createdAt: Timestamp.now() };
  } catch (error) {
    console.error('Error saving offline attendance:', error);
    throw error;
  }
};

// Get pending offline attendance records
export const getPendingOfflineAttendance = async () => {
  try {
    const q = query(
      collection(db, 'offlineAttendance'),
      where('synced', '==', false),
      orderBy('createdAt', 'asc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as OfflineAttendanceRecord));
  } catch (error) {
    console.error('Error fetching offline attendance records:', error);
    throw error;
  }
};

// Mark offline attendance record as synced
export const markOfflineAttendanceAsSynced = async (recordId: string) => {
  try {
    await updateDoc(doc(db, 'offlineAttendance', recordId), {
      synced: true,
      syncedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error('Error marking offline attendance as synced:', error);
    throw error;
  }
};

/**
 * Service for managing attendance records and QR code sessions
 */

export class AttendanceService {
  private static instance: AttendanceService;
  
  public static getInstance(): AttendanceService {
    if (!AttendanceService.instance) {
      AttendanceService.instance = new AttendanceService();
    }
    return AttendanceService.instance;
  }

  // Create a new QR code session for an event
  async createQRCodeSession(
    eventName: string,
    eventType: 'weekly' | 'special' | 'retreat' | 'holiday' | 'outreach' | 'other',
    generatedBy: string,
    eventId?: string,
    durationMinutes: number = 180
  ): Promise<QRCodeSession> {
    try {
      const sessionData = generateQRCodeSession(eventName, eventType, eventId, durationMinutes);
      
      const docRef = await addDoc(collection(db, 'qrCodeSessions'), {
        ...sessionData,
        generatedBy,
        createdAt: Timestamp.now()
      });

      const session: QRCodeSession = {
        id: docRef.id,
        ...sessionData,
        generatedBy
      } as QRCodeSession;

      return session;
    } catch (error) {
      console.error('Error creating QR code session:', error);
      throw new Error('Failed to create QR code session');
    }
  }

  // Get active QR code session
  async getActiveQRCodeSession(): Promise<QRCodeSession | null> {
    try {
      const now = new Date();
      const q = query(
        collection(db, 'qrCodeSessions'),
        where('isActive', '==', true),
        where('expiresAt', '>', now.toISOString()),
        orderBy('expiresAt', 'desc'),
        limit(1)
      );

      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        return null;
      }

      const doc = querySnapshot.docs[0];
      return {
        id: doc.id,
        ...doc.data()
      } as QRCodeSession;
    } catch (error) {
      console.error('Error getting active QR code session:', error);
      return null;
    }
  }

  // Validate QR code and check in user
  async checkInWithQRCode(
    qrCodeData: string,
    userId: string,
    userName: string,
    isVisitor: boolean = false,
    visitorInfo?: VisitorInfo
  ): Promise<{ success: boolean; message: string; attendanceId?: string }> {
    try {
      // Get current word of the day
      const currentWordOfTheDay = generateWordOfTheDay(new Date());
      
      // Validate QR code
      const validation = validateQRCodeSession(qrCodeData, currentWordOfTheDay);
      
      if (!validation.isValid) {
        return { success: false, message: validation.error || 'Invalid QR code' };
      }

      const { sessionData } = validation;
      
      // Check if sessionData exists
      if (!sessionData) {
        return { success: false, message: 'Invalid QR code data' };
      }

      // Check if required sessionData properties exist
      if (!sessionData.sessionId || !sessionData.eventType || !sessionData.eventName) {
        return { success: false, message: 'QR code data is missing required information' };
      }

      // Check if user can check in (prevent duplicates)
      if (!isVisitor) {
        const existingAttendance = await this.getTodayAttendance(sessionData.eventName);
        const checkInValidation = canUserCheckIn(userId, sessionData.sessionId, existingAttendance);
        
        if (!checkInValidation.canCheckIn) {
          return { success: false, message: checkInValidation.reason || 'Cannot check in' };
        }
      }

      // Create attendance record
      const attendanceRecord: Omit<AttendanceRecord, 'id'> = {
        userId,
        userName,
        eventId: sessionData.sessionId,
        eventType: sessionData.eventType,
        eventName: sessionData.eventName,
        checkInTime: new Date().toISOString(),
        timestamp: new Date().toISOString(),
        checkInMethod: 'qrcode',
        isVisitor,
        visitorInfo: visitorInfo ? {
          name: visitorInfo.name || visitorInfo.fullName || '',
          email: visitorInfo.email,
          phoneNumber: visitorInfo.phoneNumber,
          referredBy: visitorInfo.referredBy || visitorInfo.invitedBy,
          isFirstTime: visitorInfo.isFirstTime
        } : undefined
      };

      const docRef = await addDoc(collection(db, 'attendance'), {
        ...attendanceRecord,
        createdAt: Timestamp.now()
      });

      // Update QR code session attendance count
      if (sessionData.sessionId) {
        await this.updateSessionAttendanceCount(sessionData.sessionId);
      }

      return { 
        success: true, 
        message: 'Successfully checked in!', 
        attendanceId: docRef.id 
      };

    } catch (error) {
      console.error('Error checking in with QR code:', error);
      return { success: false, message: 'Failed to check in. Please try again.' };
    }
  }

  // Manual check-in (for admins)
  async manualCheckIn(
    userId: string,
    userName: string,
    eventName: string,
    eventType: 'weekly' | 'special' | 'retreat' | 'holiday' | 'outreach' | 'other',
    adminUserId: string,
    isVisitor: boolean = false,
    visitorInfo?: VisitorInfo
  ): Promise<{ success: boolean; message: string; attendanceId?: string }> {
    try {
      const attendanceRecord: Omit<AttendanceRecord, 'id'> = {
        userId,
        userName,
        eventType,
        eventName,
        checkInTime: new Date().toISOString(),
        timestamp: new Date().toISOString(),
        checkInMethod: 'admin',
        isVisitor,
        visitorInfo: visitorInfo ? {
          name: visitorInfo.name || visitorInfo.fullName || '',
          email: visitorInfo.email,
          phoneNumber: visitorInfo.phoneNumber,
          referredBy: visitorInfo.referredBy || visitorInfo.invitedBy,
          isFirstTime: visitorInfo.isFirstTime
        } : undefined
      };

      const docRef = await addDoc(collection(db, 'attendance'), {
        ...attendanceRecord,
        checkedInBy: adminUserId,
        createdAt: Timestamp.now()
      });

      return { 
        success: true, 
        message: 'Successfully checked in manually!', 
        attendanceId: docRef.id 
      };

    } catch (error) {
      console.error('Error with manual check-in:', error);
      return { success: false, message: 'Failed to check in manually. Please try again.' };
    }
  }

  // Get today's attendance for a specific event
  async getTodayAttendance(eventName?: string): Promise<AttendanceRecord[]> {
    try {
      const today = new Date();
      const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

      let q = query(
        collection(db, 'attendance'),
        where('checkInTime', '>=', startOfDay.toISOString()),
        where('checkInTime', '<', endOfDay.toISOString()),
        orderBy('checkInTime', 'desc')
      );

      if (eventName) {
        q = query(
          collection(db, 'attendance'),
          where('eventName', '==', eventName),
          where('checkInTime', '>=', startOfDay.toISOString()),
          where('checkInTime', '<', endOfDay.toISOString()),
          orderBy('checkInTime', 'desc')
        );
      }

      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as AttendanceRecord[];

    } catch (error) {
      console.error('Error getting today\'s attendance:', error);
      return [];
    }
  }

  // Get attendance history for a user
  async getUserAttendanceHistory(
    userId: string,
    limitCount: number = 50
  ): Promise<AttendanceRecord[]> {
    try {
      const q = query(
        collection(db, 'attendance'),
        where('userId', '==', userId),
        orderBy('checkInTime', 'desc'),
        limit(limitCount)
      );

      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as AttendanceRecord[];

    } catch (error) {
      console.error('Error getting user attendance history:', error);
      return [];
    }
  }

  // Get attendance statistics
  async getAttendanceStats(
    startDate: Date,
    endDate: Date
  ): Promise<{
    totalAttendance: number;
    uniqueMembers: number;
    visitors: number;
    averagePerDay: number;
    eventBreakdown: Record<string, number>;
  }> {
    try {
      const q = query(
        collection(db, 'attendance'),
        where('checkInTime', '>=', startDate.toISOString()),
        where('checkInTime', '<=', endDate.toISOString()),
        orderBy('checkInTime', 'asc')
      );

      const querySnapshot = await getDocs(q);
      const records = querySnapshot.docs.map(doc => doc.data()) as AttendanceRecord[];

      const uniqueMembers = new Set(records.filter(r => !r.isVisitor).map(r => r.userId)).size;
      const visitors = records.filter(r => r.isVisitor).length;
      const eventBreakdown: Record<string, number> = {};

      records.forEach(record => {
        const eventKey = record.eventName || record.eventType;
        eventBreakdown[eventKey] = (eventBreakdown[eventKey] || 0) + 1;
      });

      const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
      const averagePerDay = records.length / Math.max(daysDiff, 1);

      return {
        totalAttendance: records.length,
        uniqueMembers,
        visitors,
        averagePerDay: Math.round(averagePerDay * 100) / 100,
        eventBreakdown
      };

    } catch (error) {
      console.error('Error getting attendance stats:', error);
      return {
        totalAttendance: 0,
        uniqueMembers: 0,
        visitors: 0,
        averagePerDay: 0,
        eventBreakdown: {}
      };
    }
  }

  // Update QR code session attendance count
  private async updateSessionAttendanceCount(sessionId: string): Promise<void> {
    try {
      const sessionRef = doc(db, 'qrCodeSessions', sessionId);
      const sessionDoc = await getDoc(sessionRef);
      
      if (sessionDoc.exists()) {
        const currentCount = sessionDoc.data().attendanceCount || 0;
        await updateDoc(sessionRef, {
          attendanceCount: currentCount + 1,
          updatedAt: Timestamp.now()
        });
      }
    } catch (error) {
      console.error('Error updating session attendance count:', error);
    }
  }

  // Deactivate QR code session
  async deactivateQRCodeSession(sessionId: string): Promise<boolean> {
    try {
      const sessionRef = doc(db, 'qrCodeSessions', sessionId);
      await updateDoc(sessionRef, {
        isActive: false,
        deactivatedAt: Timestamp.now()
      });
      return true;
    } catch (error) {
      console.error('Error deactivating QR code session:', error);
      return false;
    }
  }

  // Get current word of the day
  getCurrentWordOfTheDay(): string {
    return generateWordOfTheDay(new Date());
  }

  // Offline check-in (stores locally until sync)
  async offlineCheckIn(
    userId: string,
    userName: string,
    eventName: string,
    eventType: 'weekly' | 'special' | 'retreat' | 'holiday' | 'outreach' | 'other',
    isVisitor: boolean = false,
    visitorInfo?: VisitorInfo
  ): Promise<{ success: boolean; message: string; offlineId?: string }> {
    try {
      const offlineRecord = {
        id: `offline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId,
        userName,
        eventType,
        eventName,
        checkInTime: new Date().toISOString(),
        checkInMethod: 'offline',
        isVisitor,
        visitorInfo,
        synced: false
      };

      // Store in IndexedDB (will implement this later)
      localStorage.setItem(`offline_attendance_${offlineRecord.id}`, JSON.stringify(offlineRecord));

      return {
        success: true,
        message: 'Checked in offline. Will sync when connection is restored.',
        offlineId: offlineRecord.id
      };

    } catch (error) {
      console.error('Error with offline check-in:', error);
      return { success: false, message: 'Failed to check in offline.' };
    }
  }
}
