import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit,
  doc,
  updateDoc,
  Timestamp
} from 'firebase/firestore';
import { db } from '../firebase/config';
import type { 
  PrayerRequest, 
  WelfareRequest, 
  EvangelismReport,
  MailingListSubscriber,
  Notification 
} from '../types';

/**
 * Service for managing engagement features including prayer requests,
 * welfare requests, evangelism reports, and mailing list
 */

export class EngagementService {
  private static instance: EngagementService;
  
  public static getInstance(): EngagementService {
    if (!EngagementService.instance) {
      EngagementService.instance = new EngagementService();
    }
    return EngagementService.instance;
  }

  // PRAYER REQUESTS
  async createPrayerRequest(requestData: Omit<PrayerRequest, 'id'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, 'prayerRequests'), {
        ...requestData,
        createdAt: Timestamp.now(),
        isAnswered: false
      });

      return docRef.id;
    } catch (error) {
      console.error('Error creating prayer request:', error);
      throw new Error('Failed to create prayer request');
    }
  }

  async getPrayerRequests(
    filters: {
      userId?: string;
      category?: string;
      isPublic?: boolean;
      isAnswered?: boolean;
      limit?: number;
    } = {}
  ): Promise<PrayerRequest[]> {
    try {
      let q = query(
        collection(db, 'prayerRequests'),
        orderBy('createdAt', 'desc')
      );

      if (filters.userId) {
        q = query(q, where('userId', '==', filters.userId));
      }

      if (filters.category) {
        q = query(q, where('category', '==', filters.category));
      }

      if (filters.isPublic !== undefined) {
        q = query(q, where('isPublic', '==', filters.isPublic));
      }

      if (filters.isAnswered !== undefined) {
        q = query(q, where('isAnswered', '==', filters.isAnswered));
      }

      if (filters.limit) {
        q = query(q, limit(filters.limit));
      }

      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as PrayerRequest[];

    } catch (error) {
      console.error('Error getting prayer requests:', error);
      return [];
    }
  }

  async markPrayerRequestAnswered(
    requestId: string,
    answerNote?: string
  ): Promise<boolean> {
    try {
      const requestRef = doc(db, 'prayerRequests', requestId);
      await updateDoc(requestRef, {
        isAnswered: true,
        answeredAt: Timestamp.now(),
        answerNote: answerNote || '',
        updatedAt: Timestamp.now()
      });
      return true;
    } catch (error) {
      console.error('Error marking prayer request as answered:', error);
      return false;
    }
  }

  // WELFARE REQUESTS
  async createWelfareRequest(requestData: Omit<WelfareRequest, 'id'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, 'welfareRequests'), {
        ...requestData,
        status: 'pending',
        createdAt: Timestamp.now()
      });

      return docRef.id;
    } catch (error) {
      console.error('Error creating welfare request:', error);
      throw new Error('Failed to create welfare request');
    }
  }

  async getWelfareRequests(
    filters: {
      userId?: string;
      requestType?: string;
      status?: string;
      urgency?: string;
      assignedTo?: string;
      limit?: number;
    } = {}
  ): Promise<WelfareRequest[]> {
    try {
      let q = query(
        collection(db, 'welfareRequests'),
        orderBy('createdAt', 'desc')
      );

      if (filters.userId) {
        q = query(q, where('userId', '==', filters.userId));
      }

      if (filters.requestType) {
        q = query(q, where('requestType', '==', filters.requestType));
      }

      if (filters.status) {
        q = query(q, where('status', '==', filters.status));
      }

      if (filters.urgency) {
        q = query(q, where('urgency', '==', filters.urgency));
      }

      if (filters.assignedTo) {
        q = query(q, where('assignedTo', '==', filters.assignedTo));
      }

      if (filters.limit) {
        q = query(q, limit(filters.limit));
      }

      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as WelfareRequest[];

    } catch (error) {
      console.error('Error getting welfare requests:', error);
      return [];
    }
  }

  async updateWelfareRequestStatus(
    requestId: string,
    status: 'pending' | 'in-progress' | 'resolved' | 'closed',
    assignedTo?: string,
    resolutionNotes?: string
  ): Promise<boolean> {
    try {
      const requestRef = doc(db, 'welfareRequests', requestId);
      
      // Build update data object
      const updateData: { 
        status: string; 
        updatedAt: Timestamp;
        assignedTo?: string;
        assignedAt?: Timestamp;
        resolutionNotes?: string;
        resolvedAt?: Timestamp;
      } = {
        status,
        updatedAt: Timestamp.now()
      };

      if (assignedTo) {
        updateData.assignedTo = assignedTo;
        updateData.assignedAt = Timestamp.now();
      }

      if (status === 'resolved' && resolutionNotes) {
        updateData.resolutionNotes = resolutionNotes;
        updateData.resolvedAt = Timestamp.now();
      }

      await updateDoc(requestRef, updateData);
      return true;
    } catch (error) {
      console.error('Error updating welfare request status:', error);
      return false;
    }
  }

  // EVANGELISM REPORTS
  async createEvangelismReport(reportData: Omit<EvangelismReport, 'id'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, 'evangelismReports'), {
        ...reportData,
        status: 'pending',
        featured: false,
        createdAt: Timestamp.now()
      });

      return docRef.id;
    } catch (error) {
      console.error('Error creating evangelism report:', error);
      throw new Error('Failed to create evangelism report');
    }
  }

  async getEvangelismReports(
    filters: {
      userId?: string;
      status?: string;
      featured?: boolean;
      limit?: number;
    } = {}
  ): Promise<EvangelismReport[]> {
    try {
      let q = query(
        collection(db, 'evangelismReports'),
        orderBy('createdAt', 'desc')
      );

      if (filters.userId) {
        q = query(q, where('userId', '==', filters.userId));
      }

      if (filters.status) {
        q = query(q, where('status', '==', filters.status));
      }

      if (filters.featured !== undefined) {
        q = query(q, where('featured', '==', filters.featured));
      }

      if (filters.limit) {
        q = query(q, limit(filters.limit));
      }

      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as EvangelismReport[];

    } catch (error) {
      console.error('Error getting evangelism reports:', error);
      return [];
    }
  }

  async moderateEvangelismReport(
    reportId: string,
    status: 'approved' | 'published' | 'rejected',
    moderatedBy: string,
    moderationNotes?: string,
    featured: boolean = false
  ): Promise<boolean> {
    try {
      const reportRef = doc(db, 'evangelismReports', reportId);
      await updateDoc(reportRef, {
        status,
        moderatedBy,
        moderatedAt: Timestamp.now(),
        moderationNotes: moderationNotes || '',
        featured,
        updatedAt: Timestamp.now()
      });
      return true;
    } catch (error) {
      console.error('Error moderating evangelism report:', error);
      return false;
    }
  }

  // MAILING LIST
  async subscribeToMailingList(subscriberData: Omit<MailingListSubscriber, 'id'>): Promise<string> {
    try {
      // Check if email already exists
      const existingQuery = query(
        collection(db, 'mailingList'),
        where('email', '==', subscriberData.email),
        where('isActive', '==', true)
      );
      
      const existingSnapshot = await getDocs(existingQuery);
      
      if (!existingSnapshot.empty) {
        throw new Error('Email already subscribed');
      }

      const docRef = await addDoc(collection(db, 'mailingList'), {
        ...subscriberData,
        isActive: true,
        subscribedAt: Timestamp.now()
      });

      return docRef.id;
    } catch (error) {
      console.error('Error subscribing to mailing list:', error);
      throw error;
    }
  }

  async unsubscribeFromMailingList(email: string): Promise<boolean> {
    try {
      const q = query(
        collection(db, 'mailingList'),
        where('email', '==', email),
        where('isActive', '==', true)
      );

      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        return false;
      }

      const subscriber = querySnapshot.docs[0];
      await updateDoc(subscriber.ref, {
        isActive: false,
        unsubscribedAt: Timestamp.now()
      });

      return true;
    } catch (error) {
      console.error('Error unsubscribing from mailing list:', error);
      return false;
    }
  }

  async getMailingListSubscribers(
    filters: {
      isActive?: boolean;
      subscriptionType?: string;
      categories?: string[];
      limit?: number;
    } = {}
  ): Promise<MailingListSubscriber[]> {
    try {
      let q = query(
        collection(db, 'mailingList'),
        orderBy('subscribedAt', 'desc')
      );

      if (filters.isActive !== undefined) {
        q = query(q, where('isActive', '==', filters.isActive));
      }

      if (filters.subscriptionType) {
        q = query(q, where('subscriptionType', '==', filters.subscriptionType));
      }

      if (filters.categories && filters.categories.length > 0) {
        q = query(q, where('categories', 'array-contains-any', filters.categories));
      }

      if (filters.limit) {
        q = query(q, limit(filters.limit));
      }

      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as MailingListSubscriber[];

    } catch (error) {
      console.error('Error getting mailing list subscribers:', error);
      return [];
    }
  }

  // NOTIFICATIONS
  async createNotification(notificationData: Omit<Notification, 'id'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, 'notifications'), {
        ...notificationData,
        isRead: false,
        createdAt: Timestamp.now()
      });

      return docRef.id;
    } catch (error) {
      console.error('Error creating notification:', error);
      throw new Error('Failed to create notification');
    }
  }

  async getUserNotifications(
    userId: string,
    filters: {
      isRead?: boolean;
      category?: string;
      limit?: number;
    } = {}
  ): Promise<Notification[]> {
    try {
      let q = query(
        collection(db, 'notifications'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );

      if (filters.isRead !== undefined) {
        q = query(q, where('isRead', '==', filters.isRead));
      }

      if (filters.category) {
        q = query(q, where('category', '==', filters.category));
      }

      if (filters.limit) {
        q = query(q, limit(filters.limit));
      }

      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Notification[];

    } catch (error) {
      console.error('Error getting user notifications:', error);
      return [];
    }
  }

  async markNotificationAsRead(notificationId: string): Promise<boolean> {
    try {
      const notificationRef = doc(db, 'notifications', notificationId);
      await updateDoc(notificationRef, {
        isRead: true
      });
      return true;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      return false;
    }
  }

  // STATISTICS
  async getEngagementStats(): Promise<{
    totalPrayerRequests: number;
    answeredPrayerRequests: number;
    totalWelfareRequests: number;
    resolvedWelfareRequests: number;
    totalEvangelismReports: number;
    publishedEvangelismReports: number;
    mailingListSubscribers: number;
  }> {
    try {
      const [
        prayerRequests,
        welfareRequests,
        evangelismReports,
        subscribers
      ] = await Promise.all([
        this.getPrayerRequests(),
        this.getWelfareRequests(),
        this.getEvangelismReports(),
        this.getMailingListSubscribers({ isActive: true })
      ]);

      return {
        totalPrayerRequests: prayerRequests.length,
        answeredPrayerRequests: prayerRequests.filter(req => req.isAnswered).length,
        totalWelfareRequests: welfareRequests.length,
        resolvedWelfareRequests: welfareRequests.filter(req => req.status === 'completed').length,
        totalEvangelismReports: evangelismReports.length,
        publishedEvangelismReports: evangelismReports.filter(rep => rep.status === 'published').length,
        mailingListSubscribers: subscribers.length
      };

    } catch (error) {
      console.error('Error getting engagement stats:', error);
      return {
        totalPrayerRequests: 0,
        answeredPrayerRequests: 0,
        totalWelfareRequests: 0,
        resolvedWelfareRequests: 0,
        totalEvangelismReports: 0,
        publishedEvangelismReports: 0,
        mailingListSubscribers: 0
      };
    }
  }
}