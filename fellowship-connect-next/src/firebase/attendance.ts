import { 
  collection, 
  addDoc, 
  query, 
  where, 
  getDocs, 
  orderBy, 
  limit,
  Timestamp
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import type { AttendanceRecord, QRCodeData, VisitorInfo } from '../types';

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

// Get recent attendance records for a user
export const getUserAttendance = async (userId: string, limitCount = 10) => {
  try {
    const q = query(
      collection(db, 'attendance'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AttendanceRecord));
  } catch (error) {
    console.error('Error fetching user attendance:', error);
    throw error;
  }
};

// Generate QR code data for an event
export const generateQRCodeData = async (eventId: string, eventName: string): Promise<QRCodeData> => {
  const qrData: QRCodeData = {
    eventId,
    eventName,
    timestamp: Date.now(),
    expiresAt: Date.now() + (2 * 60 * 60 * 1000), // Expires in 2 hours
  };
  return qrData;
};

/**
 * Check-in service for attendance tracking
 */
export const attendanceService = {
  /**
   * Records a member's check-in for an event
   * 
   * @param userId - The user's ID
   * @param userName - The user's display name
   * @param eventId - Optional ID of the event being checked into
   * @param eventType - The type of event
   * @param eventName - Optional name of the event
   * @param checkInMethod - The method used for check-in ('self', 'admin', 'qrcode', 'offline')
   * @returns The ID of the newly created attendance record
   */
  async checkInMember(
    userId: string,
    userName: string,
    eventId?: string,
    eventType: 'weekly' | 'special' | 'retreat' | 'holiday' | 'outreach' | 'other' = 'weekly',
    eventName?: string,
    checkInMethod: 'self' | 'admin' | 'qrcode' | 'offline' = 'self'
  ): Promise<string> {
    try {
      // Check if member has already checked in today for this event
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const todayStr = today.toISOString().split('T')[0];
      const existingCheckInsQuery = query(
        collection(db, 'attendance'),
        where('userId', '==', userId),
        where('checkInTime', '>=', todayStr),
        where('eventId', '==', eventId || null)
      );
      
      const existingCheckIns = await getDocs(existingCheckInsQuery);
      
      if (!existingCheckIns.empty) {
        throw new Error('Member has already checked in for this event today');
      }
      
      // Create new attendance record
      const attendanceRecord: AttendanceRecord = {
        userId,
        userName,
        eventId,
        eventType,
        eventName,
        checkInTime: new Date().toISOString(),
        timestamp: new Date().toISOString(),
        checkInMethod,
        isVisitor: false
      };
      
      const docRef = await addDoc(collection(db, 'attendance'), attendanceRecord);
      return docRef.id;
    } catch (error) {
      console.error('Error checking in member:', error);
      throw error;
    }
  },
  
  /**
   * Records a visitor's check-in for an event
   * 
   * @param visitorInfo - Information about the visitor
   * @param eventId - Optional ID of the event being checked into
   * @param eventType - The type of event
   * @param eventName - Optional name of the event
   * @param checkInMethod - The method used for check-in ('admin', 'qrcode', 'offline')
   * @returns The ID of the newly created attendance record
   */
  async checkInVisitor(
    visitorInfo: VisitorInfo,
    eventId?: string,
    eventType: 'weekly' | 'special' | 'retreat' | 'holiday' | 'outreach' | 'other' = 'weekly',
    eventName?: string,
    checkInMethod: 'admin' | 'qrcode' | 'offline' = 'admin'
  ): Promise<string> {
    try {
      // Create new visitor attendance record
      const attendanceRecord: AttendanceRecord = {
        userId: 'visitor',
        userName: visitorInfo.fullName || visitorInfo.name,
        eventId,
        eventType,
        eventName,
        checkInTime: new Date().toISOString(),
        timestamp: new Date().toISOString(),
        checkInMethod,
        isVisitor: true,
        visitorInfo: {
          name: visitorInfo.name || visitorInfo.fullName || '',
          email: visitorInfo.email,
          phoneNumber: visitorInfo.phoneNumber,
          referredBy: visitorInfo.referredBy || visitorInfo.invitedBy,
          isFirstTime: visitorInfo.isFirstTime
        }
      };
      
      const docRef = await addDoc(collection(db, 'attendance'), attendanceRecord);
      return docRef.id;
    } catch (error) {
      console.error('Error checking in visitor:', error);
      throw error;
    }
  },
  
  /**
   * Gets today's attendance records
   * 
   * @returns An array of attendance records for today
   */
  async getTodayAttendance(): Promise<AttendanceRecord[]> {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const todayStr = today.toISOString().split('T')[0];
      const attendanceQuery = query(
        collection(db, 'attendance'),
        where('checkInTime', '>=', todayStr),
        orderBy('checkInTime', 'desc')
      );
      
      const querySnapshot = await getDocs(attendanceQuery);
      return querySnapshot.docs.map(doc => ({ 
        id: doc.id,
        ...doc.data() 
      } as AttendanceRecord));
    } catch (error) {
      console.error('Error getting today\'s attendance:', error);
      throw error;
    }
  },
  
  /**
   * Gets attendance records for a specific date range
   * 
   * @param startDate - The start date for the query
   * @param endDate - The end date for the query
   * @returns An array of attendance records for the date range
   */
  async getAttendanceByDateRange(startDate: Date, endDate: Date): Promise<AttendanceRecord[]> {
    try {
      const startStr = startDate.toISOString().split('T')[0];
      const endStr = endDate.toISOString().split('T')[0];
      
      const attendanceQuery = query(
        collection(db, 'attendance'),
        where('checkInTime', '>=', startStr),
        where('checkInTime', '<=', endStr),
        orderBy('checkInTime', 'desc')
      );
      
      const querySnapshot = await getDocs(attendanceQuery);
      return querySnapshot.docs.map(doc => ({ 
        id: doc.id,
        ...doc.data() 
      } as AttendanceRecord));
    } catch (error) {
      console.error('Error getting attendance by date range:', error);
      throw error;
    }
  },
  
  /**
   * Gets all attendance records for a specific user
   * 
   * @param userId - The ID of the user
   * @returns An array of attendance records for the user
   */
  async getUserAttendanceHistory(userId: string): Promise<AttendanceRecord[]> {
    try {
      const attendanceQuery = query(
        collection(db, 'attendance'),
        where('userId', '==', userId),
        orderBy('checkInTime', 'desc')
      );
      
      const querySnapshot = await getDocs(attendanceQuery);
      return querySnapshot.docs.map(doc => ({ 
        id: doc.id,
        ...doc.data() 
      } as AttendanceRecord));
    } catch (error) {
      console.error('Error getting user attendance history:', error);
      throw error;
    }
  }
};