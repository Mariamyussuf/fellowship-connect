import { addDoc, collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from './config';
import type { AttendanceRecord, VisitorInfo } from '../types';

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
        userName: visitorInfo.fullName,
        eventId,
        eventType,
        eventName,
        checkInTime: new Date().toISOString(),
        checkInMethod,
        isVisitor: true,
        visitorInfo
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
   * Gets attendance records for a specific event
   * 
   * @param eventId - The ID of the event
   * @returns An array of attendance records for the event
   */
  async getEventAttendance(eventId: string): Promise<AttendanceRecord[]> {
    try {
      const attendanceQuery = query(
        collection(db, 'attendance'),
        where('eventId', '==', eventId),
        orderBy('checkInTime', 'desc')
      );
      
      const querySnapshot = await getDocs(attendanceQuery);
      return querySnapshot.docs.map(doc => ({ 
        id: doc.id,
        ...doc.data() 
      } as AttendanceRecord));
    } catch (error) {
      console.error('Error getting event attendance:', error);
      throw error;
    }
  },
  
  /**
   * Gets attendance records for a specific member
   * 
   * @param userId - The ID of the member
   * @param limit - Optional limit on the number of records to return
   * @returns An array of attendance records for the member
   */
  async getMemberAttendance(userId: string, resultLimit: number = 20): Promise<AttendanceRecord[]> {
    try {
      const attendanceQuery = query(
        collection(db, 'attendance'),
        where('userId', '==', userId),
        orderBy('checkInTime', 'desc'),
        limit(resultLimit)
      );
      
      const querySnapshot = await getDocs(attendanceQuery);
      return querySnapshot.docs.map(doc => ({ 
        id: doc.id,
        ...doc.data() 
      } as AttendanceRecord));
    } catch (error) {
      console.error('Error getting member attendance:', error);
      throw error;
    }
  },
  
  /**
   * Gets records for first-time visitors
   * 
   * @param resultLimit - Optional limit on the number of records to return
   * @returns An array of attendance records for first-time visitors
   */
  async getFirstTimeVisitors(resultLimit: number = 20): Promise<AttendanceRecord[]> {
    try {
      const visitorsQuery = query(
        collection(db, 'attendance'),
        where('isVisitor', '==', true),
        where('visitorInfo.isFirstTime', '==', true),
        orderBy('checkInTime', 'desc'),
        limit(resultLimit)
      );
      
      const querySnapshot = await getDocs(visitorsQuery);
      return querySnapshot.docs.map(doc => ({ 
        id: doc.id,
        ...doc.data() 
      } as AttendanceRecord));
    } catch (error) {
      console.error('Error getting first-time visitors:', error);
      throw error;
    }
  }
};