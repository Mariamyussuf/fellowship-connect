import { Timestamp } from 'firebase/firestore';
import { getFirebaseAdmin } from '../../lib/firebase-admin';
import { BaseService } from './base.service';
import { PrayerRequest, WelfareSupport, EvangelismReport } from '../../types/database';

/**
 * Prayer Service extending BaseService
 * Handles prayer requests, welfare support, and evangelism reports
 */
export class PrayerService extends BaseService<PrayerRequest> {
  constructor() {
    super('prayerRequests');
  }

  /**
   * Submit a prayer request
   * @param userId User ID
   * @param data Prayer request data
   * @param isAnonymous Whether the request is anonymous
   * @returns Prayer request result
   */
  async submitPrayerRequest(
    userId: string,
    data: { title: string; description: string; isPublic: boolean },
    isAnonymous: boolean
  ): Promise<{ success: boolean; requestId?: string; message?: string }> {
    try {
      const { db } = getFirebaseAdmin();
      
      const prayerData: any = {
        userId,
        title: data.title,
        description: data.description,
        isAnonymous,
        status: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      const docRef = await db.collection('prayerRequests').add({
        ...prayerData,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });
      
      // Log audit action
      await this.logAudit('SUBMIT_PRAYER_REQUEST', docRef.id, prayerData);
      
      return { 
        success: true, 
        requestId: docRef.id 
      };
    } catch (error) {
      console.error('Submit prayer request error:', error);
      return { 
        success: false, 
        message: 'Failed to submit prayer request' 
      };
    }
  }

  /**
   * Get prayer requests with filtering and pagination
   * @param filters Filters to apply
   * @param pagination Pagination parameters
   * @returns Prayer requests
   */
  async getPrayerRequests(
    filters: { status?: string; userId?: string } = {},
    pagination: { limit?: number; lastDoc?: any } = {}
  ): Promise<{ success: boolean; requests?: PrayerRequest[]; lastDoc?: any; message?: string }> {
    try {
      const { db } = getFirebaseAdmin();
      
      let query: any = db.collection('prayerRequests').orderBy('createdAt', 'desc');
      
      // Apply filters
      if (filters.status) {
        query = query.where('status', '==', filters.status);
      }
      
      if (filters.userId) {
        query = query.where('userId', '==', filters.userId);
      }
      
      // Apply pagination
      if (pagination.limit) {
        query = query.limit(pagination.limit);
      }
      
      if (pagination.lastDoc) {
        query = query.startAfter(pagination.lastDoc);
      }
      
      const querySnapshot = await query.get();
      const requests: PrayerRequest[] = [];
      
      querySnapshot.forEach((doc: any) => {
        const requestData: any = { id: doc.id, ...(doc.data() as any) };
        
        // Hide user info for anonymous requests
        if (requestData.isAnonymous) {
          delete requestData.userId;
          delete requestData.userName;
        }
        
        requests.push(requestData as PrayerRequest);
      });
      
      const lastDoc = querySnapshot.docs[querySnapshot.docs.length - 1];
      
      // Log audit action
      await this.logAudit('GET_PRAYER_REQUESTS', 'user', { filters, pagination });
      
      return { 
        success: true, 
        requests,
        lastDoc
      };
    } catch (error) {
      console.error('Get prayer requests error:', error);
      return { 
        success: false, 
        message: 'Failed to get prayer requests' 
      };
    }
  }

  /**
   * Update prayer request status (admin only)
   * @param requestId Request ID
   * @param status New status
   * @returns Success status
   */
  async updatePrayerStatus(
    requestId: string,
    status: 'pending' | 'approved' | 'rejected' | 'answered' | 'archived'
  ): Promise<{ success: boolean; message?: string }> {
    try {
      const { db } = getFirebaseAdmin();
      
      await db.collection('prayerRequests').doc(requestId).update({
        status,
        updatedAt: Timestamp.now()
      });
      
      // Log audit action
      await this.logAudit('UPDATE_PRAYER_STATUS', requestId, { status });
      
      return { 
        success: true, 
        message: 'Prayer request status updated successfully' 
      };
    } catch (error) {
      console.error('Update prayer status error:', error);
      return { 
        success: false, 
        message: 'Failed to update prayer request status' 
      };
    }
  }

  /**
   * Delete prayer request (admin only)
   * @param requestId Request ID
   * @returns Success status
   */
  async deletePrayerRequest(requestId: string): Promise<{ success: boolean; message?: string }> {
    try {
      const { db } = getFirebaseAdmin();
      
      await db.collection('prayerRequests').doc(requestId).delete();
      
      // Log audit action
      await this.logAudit('DELETE_PRAYER_REQUEST', requestId, {});
      
      return { 
        success: true, 
        message: 'Prayer request deleted successfully' 
      };
    } catch (error) {
      console.error('Delete prayer request error:', error);
      return { 
        success: false, 
        message: 'Failed to delete prayer request' 
      };
    }
  }

  /**
   * Submit welfare support request
   * @param userId User ID
   * @param data Welfare support data
   * @returns Welfare support result
   */
  async submitWelfareSupport(
    userId: string,
    data: { title: string; description: string; category: string; urgency: string; isAnonymous: boolean }
  ): Promise<{ success: boolean; requestId?: string; message?: string }> {
    try {
      const { db } = getFirebaseAdmin();
      
      const welfareData: any = {
        userId,
        category: data.category,
        description: data.description,
        urgency: data.urgency as any,
        status: 'pending',
        isAnonymous: data.isAnonymous,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      const docRef = await db.collection('welfareSupport').add({
        ...welfareData,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });
      
      // Log audit action
      await this.logAudit('SUBMIT_WELFARE_SUPPORT', docRef.id, welfareData);
      
      return { 
        success: true, 
        requestId: docRef.id 
      };
    } catch (error) {
      console.error('Submit welfare support error:', error);
      return { 
        success: false, 
        message: 'Failed to submit welfare support request' 
      };
    }
  }

  /**
   * Get welfare requests with filtering and pagination
   * @param filters Filters to apply
   * @param pagination Pagination parameters
   * @returns Welfare requests
   */
  async getWelfareRequests(
    filters: { status?: string } = {},
    pagination: { limit?: number; lastDoc?: any } = {}
  ): Promise<{ success: boolean; requests?: WelfareSupport[]; lastDoc?: any; message?: string }> {
    try {
      const { db } = getFirebaseAdmin();
      
      let query: any = db.collection('welfareSupport').orderBy('createdAt', 'desc');
      
      // Apply filters
      if (filters.status) {
        query = query.where('status', '==', filters.status);
      }
      
      // Apply pagination
      if (pagination.limit) {
        query = query.limit(pagination.limit);
      }
      
      if (pagination.lastDoc) {
        query = query.startAfter(pagination.lastDoc);
      }
      
      const querySnapshot = await query.get();
      const requests: WelfareSupport[] = [];
      
      querySnapshot.forEach((doc: any) => {
        const requestData: any = { id: doc.id, ...(doc.data() as any) };
        
        // Hide user info for anonymous requests
        if (requestData.isAnonymous) {
          delete requestData.userId;
          delete requestData.userName;
        }
        
        requests.push(requestData as WelfareSupport);
      });
      
      const lastDoc = querySnapshot.docs[querySnapshot.docs.length - 1];
      
      // Log audit action
      await this.logAudit('GET_WELFARE_REQUESTS', 'admin', { filters, pagination });
      
      return { 
        success: true, 
        requests,
        lastDoc
      };
    } catch (error) {
      console.error('Get welfare requests error:', error);
      return { 
        success: false, 
        message: 'Failed to get welfare requests' 
      };
    }
  }

  /**
   * Update welfare request status
   * @param requestId Request ID
   * @param status New status
   * @param notes Additional notes
   * @returns Success status
   */
  async updateWelfareStatus(
    requestId: string,
    status: 'pending' | 'reviewed' | 'approved' | 'completed' | 'declined',
    notes?: string
  ): Promise<{ success: boolean; message?: string }> {
    try {
      const { db } = getFirebaseAdmin();
      
      const updateData: any = {
        status,
        updatedAt: Timestamp.now()
      };
      
      if (notes) {
        updateData.adminNotes = notes;
      }
      
      await db.collection('welfareSupport').doc(requestId).update(updateData);
      
      // Log audit action
      await this.logAudit('UPDATE_WELFARE_STATUS', requestId, { status, notes });
      
      return { 
        success: true, 
        message: 'Welfare request status updated successfully' 
      };
    } catch (error) {
      console.error('Update welfare status error:', error);
      return { 
        success: false, 
        message: 'Failed to update welfare request status' 
      };
    }
  }

  /**
   * Submit evangelism report
   * @param userId User ID
   * @param data Evangelism report data
   * @returns Evangelism report result
   */
  async submitEvangelismReport(
    userId: string,
    data: { title: string; description: string; location?: string; peopleReached: number; conversions: number; followUpRequired: boolean; followUpNotes?: string }
  ): Promise<{ success: boolean; reportId?: string; message?: string }> {
    try {
      const { db } = getFirebaseAdmin();
      
      const reportData: any = {
        userId,
        location: data.location || '',
        contacts: '',
        followUps: data.peopleReached,
        notes: data.followUpNotes || null,
        date: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      // Add optional fields
      if (data.title) reportData.title = data.title;
      if (data.description) reportData.description = data.description;
      if (data.followUpRequired !== undefined) reportData.followUpRequired = data.followUpRequired;
      
      const docRef = await db.collection('evangelismReports').add({
        ...reportData,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });
      
      // Log audit action
      await this.logAudit('SUBMIT_EVANGELISM_REPORT', docRef.id, reportData);
      
      return { 
        success: true, 
        reportId: docRef.id 
      };
    } catch (error) {
      console.error('Submit evangelism report error:', error);
      return { 
        success: false, 
        message: 'Failed to submit evangelism report' 
      };
    }
  }

  /**
   * Get evangelism reports with filtering and pagination
   * @param filters Filters to apply
   * @param pagination Pagination parameters
   * @returns Evangelism reports
   */
  async getEvangelismReports(
    filters: { status?: string } = {},
    pagination: { limit?: number; lastDoc?: any } = {}
  ): Promise<{ success: boolean; reports?: EvangelismReport[]; lastDoc?: any; message?: string }> {
    try {
      const { db } = getFirebaseAdmin();
      
      let query: any = db.collection('evangelismReports').orderBy('createdAt', 'desc');
      
      // Apply filters
      if (filters.status) {
        query = query.where('status', '==', filters.status);
      }
      
      // Apply pagination
      if (pagination.limit) {
        query = query.limit(pagination.limit);
      }
      
      if (pagination.lastDoc) {
        query = query.startAfter(pagination.lastDoc);
      }
      
      const querySnapshot = await query.get();
      const reports: EvangelismReport[] = [];
      
      querySnapshot.forEach((doc: any) => {
        reports.push({ id: doc.id, ...(doc.data() as any) } as EvangelismReport);
      });
      
      const lastDoc = querySnapshot.docs[querySnapshot.docs.length - 1];
      
      // Log audit action
      await this.logAudit('GET_EVANGELISM_REPORTS', 'admin', { filters, pagination });
      
      return { 
        success: true, 
        reports,
        lastDoc
      };
    } catch (error) {
      console.error('Get evangelism reports error:', error);
      return { 
        success: false, 
        message: 'Failed to get evangelism reports' 
      };
    }
  }
}