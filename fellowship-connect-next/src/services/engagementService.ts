import { 
  collection, 
  query, 
  where, 
  getDocs, 
  doc, 
  addDoc, 
  updateDoc, 
  orderBy, 
  limit,
  startAfter,
  Timestamp
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import type { PrayerRequest, WelfareSupport, EvangelismReport, Notification, WelfareRequest, MailingListSubscriber } from '../types';
import type { QueryDocumentSnapshot } from 'firebase/firestore';

// Create a new prayer request
export const createPrayerRequest = async (request: Omit<PrayerRequest, 'id' | 'createdAt'>) => {
  try {
    const docRef = await addDoc(collection(db, 'prayerRequests'), {
      ...request,
      status: 'pending',
      createdAt: Timestamp.now(),
    });
    return { id: docRef.id, ...request, status: 'pending', createdAt: Timestamp.now() };
  } catch (error) {
    console.error('Error creating prayer request:', error);
    throw error;
  }
};

// Get prayer requests for a user with pagination
export const getUserPrayerRequests = async (userId: string, lastDoc: QueryDocumentSnapshot | null = null, pageSize = 10) => {
  try {
    let q = query(
      collection(db, 'prayerRequests'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(pageSize)
    );

    if (lastDoc) {
      q = query(q, startAfter(lastDoc));
    }

    const querySnapshot = await getDocs(q);
    const requests = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as PrayerRequest));
    return { requests, lastDoc: querySnapshot.docs[querySnapshot.docs.length - 1] };
  } catch (error) {
    console.error('Error fetching user prayer requests:', error);
    throw error;
  }
};

// Get all prayer requests for admin with pagination
export const getAllPrayerRequests = async (lastDoc: QueryDocumentSnapshot | null = null, pageSize = 20) => {
  try {
    let q = query(
      collection(db, 'prayerRequests'),
      orderBy('createdAt', 'desc'),
      limit(pageSize)
    );

    if (lastDoc) {
      q = query(q, startAfter(lastDoc));
    }

    const querySnapshot = await getDocs(q);
    const requests = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as PrayerRequest));
    return { requests, lastDoc: querySnapshot.docs[querySnapshot.docs.length - 1] };
  } catch (error) {
    console.error('Error fetching all prayer requests:', error);
    throw error;
  }
};

// Update prayer request status
export const updatePrayerRequestStatus = async (requestId: string, status: 'approved' | 'rejected' | 'pending') => {
  try {
    await updateDoc(doc(db, 'prayerRequests', requestId), { status, updatedAt: Timestamp.now() });
  } catch (error) {
    console.error('Error updating prayer request status:', error);
    throw error;
  }
};

// Create a new welfare support request
export const createWelfareSupportRequest = async (request: Omit<WelfareSupport, 'id' | 'createdAt'>) => {
  try {
    const docRef = await addDoc(collection(db, 'welfareSupport'), {
      ...request,
      status: 'pending',
      createdAt: Timestamp.now(),
    });
    return { id: docRef.id, ...request, status: 'pending', createdAt: Timestamp.now() };
  } catch (error) {
    console.error('Error creating welfare support request:', error);
    throw error;
  }
};

// Get welfare support requests for a user with pagination
export const getUserWelfareSupportRequests = async (userId: string, lastDoc: QueryDocumentSnapshot | null = null, pageSize = 10) => {
  try {
    let q = query(
      collection(db, 'welfareSupport'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(pageSize)
    );

    if (lastDoc) {
      q = query(q, startAfter(lastDoc));
    }

    const querySnapshot = await getDocs(q);
    const requests = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as WelfareSupport));
    return { requests, lastDoc: querySnapshot.docs[querySnapshot.docs.length - 1] };
  } catch (error) {
    console.error('Error fetching user welfare support requests:', error);
    throw error;
  }
};

// Get all welfare support requests for admin with pagination
export const getAllWelfareSupportRequests = async (lastDoc: QueryDocumentSnapshot | null = null, pageSize = 20) => {
  try {
    let q = query(
      collection(db, 'welfareSupport'),
      orderBy('createdAt', 'desc'),
      limit(pageSize)
    );

    if (lastDoc) {
      q = query(q, startAfter(lastDoc));
    }

    const querySnapshot = await getDocs(q);
    const requests = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as WelfareSupport));
    return { requests, lastDoc: querySnapshot.docs[querySnapshot.docs.length - 1] };
  } catch (error) {
    console.error('Error fetching all welfare support requests:', error);
    throw error;
  }
};

// Update welfare support request status
export const updateWelfareSupportStatus = async (requestId: string, status: 'approved' | 'rejected' | 'pending') => {
  try {
    await updateDoc(doc(db, 'welfareSupport', requestId), { status, updatedAt: Timestamp.now() });
  } catch (error) {
    console.error('Error updating welfare support request status:', error);
    throw error;
  }
};

// Create a new evangelism report
export const createEvangelismReport = async (report: Omit<EvangelismReport, 'id' | 'createdAt'>) => {
  try {
    const docRef = await addDoc(collection(db, 'evangelismReports'), {
      ...report,
      createdAt: Timestamp.now(),
    });
    return { id: docRef.id, ...report, createdAt: Timestamp.now() };
  } catch (error) {
    console.error('Error creating evangelism report:', error);
    throw error;
  }
};

// Get evangelism reports for a user with pagination
export const getUserEvangelismReports = async (userId: string, lastDoc: QueryDocumentSnapshot | null = null, pageSize = 10) => {
  try {
    let q = query(
      collection(db, 'evangelismReports'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(pageSize)
    );

    if (lastDoc) {
      q = query(q, startAfter(lastDoc));
    }

    const querySnapshot = await getDocs(q);
    const reports = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as EvangelismReport));
    return { reports, lastDoc: querySnapshot.docs[querySnapshot.docs.length - 1] };
  } catch (error) {
    console.error('Error fetching user evangelism reports:', error);
    throw error;
  }
};

// Get all evangelism reports for admin with pagination
export const getAllEvangelismReports = async (lastDoc: QueryDocumentSnapshot | null = null, pageSize = 20) => {
  try {
    let q = query(
      collection(db, 'evangelismReports'),
      orderBy('createdAt', 'desc'),
      limit(pageSize)
    );

    if (lastDoc) {
      q = query(q, startAfter(lastDoc));
    }

    const querySnapshot = await getDocs(q);
    const reports = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as EvangelismReport));
    return { reports, lastDoc: querySnapshot.docs[querySnapshot.docs.length - 1] };
  } catch (error) {
    console.error('Error fetching all evangelism reports:', error);
    throw error;
  }
};

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
      } as PrayerRequest));
    } catch (error) {
      console.error('Error getting prayer requests:', error);
      return [];
    }
  }

  async updatePrayerRequest(
    requestId: string, 
    updates: Partial<PrayerRequest>
  ): Promise<void> {
    try {
      const prayerRef = doc(db, 'prayerRequests', requestId);
      await updateDoc(prayerRef, updates);
    } catch (error) {
      console.error('Error updating prayer request:', error);
      throw error;
    }
  }

  // WELFARE REQUESTS
  async createWelfareRequest(requestData: Omit<WelfareRequest, 'id'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, 'welfareSupport'), {
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
      limit?: number;
    } = {}
  ): Promise<WelfareRequest[]> {
    try {
      let q = query(
        collection(db, 'welfareSupport'),
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

      if (filters.limit) {
        q = query(q, limit(filters.limit));
      }

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data() 
      } as WelfareRequest));
    } catch (error) {
      console.error('Error getting welfare requests:', error);
      return [];
    }
  }

  async updateWelfareRequest(
    requestId: string, 
    updates: Partial<WelfareRequest>
  ): Promise<void> {
    try {
      const welfareRef = doc(db, 'welfareSupport', requestId);
      await updateDoc(welfareRef, updates);
    } catch (error) {
      console.error('Error updating welfare request:', error);
      throw error;
    }
  }

  // EVANGELISM REPORTS
  async createEvangelismReport(reportData: Omit<EvangelismReport, 'id'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, 'evangelismReports'), {
        ...reportData,
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
      } as EvangelismReport));
    } catch (error) {
      console.error('Error getting evangelism reports:', error);
      return [];
    }
  }

  async updateEvangelismReport(
    reportId: string, 
    updates: Partial<EvangelismReport>
  ): Promise<void> {
    try {
      const reportRef = doc(db, 'evangelismReports', reportId);
      await updateDoc(reportRef, updates);
    } catch (error) {
      console.error('Error updating evangelism report:', error);
      throw error;
    }
  }

  // MAILING LIST
  async subscribeToMailingList(
    email: string,
    phoneNumber?: string,
    fullName?: string,
    categories: string[] = ['general']
  ): Promise<string> {
    try {
      // Check if subscriber already exists
      const existingQuery = query(
        collection(db, 'mailingList'),
        where('email', '==', email)
      );
      
      const existingSnapshot = await getDocs(existingQuery);
      
      if (!existingSnapshot.empty) {
        const existingDoc = existingSnapshot.docs[0];
        // Update existing subscription
        await updateDoc(doc(db, 'mailingList', existingDoc.id), {
          phoneNumber: phoneNumber || existingDoc.data().phoneNumber,
          fullName: fullName || existingDoc.data().fullName,
          categories,
          isActive: true,
          subscribedAt: Timestamp.now()
        });
        return existingDoc.id;
      }

      // Create new subscription
      const docRef = await addDoc(collection(db, 'mailingList'), {
        email,
        phoneNumber: phoneNumber || null,
        fullName: fullName || null,
        categories,
        subscriptionType: phoneNumber ? 'both' : 'email',
        isActive: true,
        subscribedAt: Timestamp.now()
      });

      return docRef.id;
    } catch (error) {
      console.error('Error subscribing to mailing list:', error);
      throw new Error('Failed to subscribe to mailing list');
    }
  }

  async getMailingListSubscribers(
    filters: {
      isActive?: boolean;
      category?: string;
    } = {}
  ): Promise<MailingListSubscriber[]> {
    try {
      let q = query(collection(db, 'mailingList'));

      if (filters.isActive !== undefined) {
        q = query(q, where('isActive', '==', filters.isActive));
      }

      if (filters.category) {
        q = query(q, where('categories', 'array-contains', filters.category));
      }

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data() 
      } as MailingListSubscriber));
    } catch (error) {
      console.error('Error getting mailing list subscribers:', error);
      return [];
    }
  }

  async unsubscribeFromMailingList(email: string): Promise<boolean> {
    try {
      const q = query(
        collection(db, 'mailingList'),
        where('email', '==', email)
      );
      
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        return false;
      }

      const docRef = doc(db, 'mailingList', querySnapshot.docs[0].id);
      await updateDoc(docRef, {
        isActive: false,
        unsubscribedAt: Timestamp.now()
      });

      return true;
    } catch (error) {
      console.error('Error unsubscribing from mailing list:', error);
      return false;
    }
  }

  // NOTIFICATIONS
  async createNotification(notificationData: Omit<Notification, 'id' | 'createdAt'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, 'notifications'), {
        ...notificationData,
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
      } as Notification));

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