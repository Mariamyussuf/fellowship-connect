import { sendNotificationSchema, broadcastNotificationSchema } from '@/lib/schemas';
import { AuthenticatedUser } from '@/lib/authMiddleware';
import type FirebaseFirestore from 'firebase-admin/firestore';
import { getFirebaseAdmin } from '@/lib/firebaseAdmin';

interface Notification {
  id?: string;
  title: string;
  message: string;
  type: string;
  priority: string;
  recipients?: string[];
  senderId: string;
  senderEmail?: string;
  senderName?: string;
  sentAt: string;
  status: string;
  [key: string]: unknown;
}

interface SendNotificationResult {
  success: boolean;
  message?: string;
  error?: string;
}

interface GetNotificationHistoryResult {
  success: boolean;
  message?: string;
  error?: string;
  notifications?: Notification[];
  total?: number;
}

// Send notification
export async function sendNotification(data: Record<string, unknown>, currentUser: AuthenticatedUser): Promise<SendNotificationResult> {
  try {
    // Validate input
    const validatedData = sendNotificationSchema.parse(data);
    
    // Only authenticated users can send notifications
    if (!currentUser) {
      return { success: false, error: 'Authentication required' };
    }
    
    // Check permissions - only admins can send notifications
    if (!['admin', 'super-admin', 'chaplain'].includes(currentUser.role)) {
      return { success: false, error: 'Insufficient permissions' };
    }
    
    // Get Firebase services
    const { db } = await getFirebaseAdmin();
    if (!db) {
      return { success: false, error: 'Database not available' };
    }
    
    // Create notification record in Firestore
    const notificationData: Omit<Notification, 'id'> = {
      ...validatedData,
      senderId: currentUser.uid,
      senderEmail: currentUser.email || '',
      senderName: currentUser.customClaims?.name || '',
      sentAt: new Date().toISOString(),
      status: 'sent'
    };
    
    await db.collection('notifications').add(notificationData);
    
    // In a real implementation, you would integrate with a notification service
    // like Firebase Cloud Messaging, SendGrid, or Twilio
    // For now, we'll just log the notification
    
    console.log('Notification sent:', notificationData);
    
    return {
      success: true,
      message: 'Notification sent successfully'
    };
  } catch (error: unknown) {
    console.error('Send notification error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to send notification';
    return { success: false, error: errorMessage };
  }
}

// Broadcast notification
export async function broadcastNotification(data: Record<string, unknown>, currentUser: AuthenticatedUser): Promise<SendNotificationResult> {
  try {
    // Validate input
    const validatedData = broadcastNotificationSchema.parse(data);
    
    // Only authenticated users can broadcast notifications
    if (!currentUser) {
      return { success: false, error: 'Authentication required' };
    }
    
    // Check permissions - only admins can broadcast notifications
    if (!['admin', 'super-admin', 'chaplain'].includes(currentUser.role)) {
      return { success: false, error: 'Insufficient permissions' };
    }
    
    // Get Firebase services
    const { db } = await getFirebaseAdmin();
    if (!db) {
      return { success: false, error: 'Database not available' };
    }
    
    // Create notification record in Firestore
    const notificationData: Omit<Notification, 'id'> = {
      ...validatedData,
      senderId: currentUser.uid,
      senderEmail: currentUser.email || '',
      senderName: currentUser.customClaims?.name || '',
      sentAt: new Date().toISOString(),
      status: 'broadcast'
    };
    
    await db.collection('notifications').add(notificationData);
    
    // In a real implementation, you would integrate with a notification service
    // and send to the target group
    // For now, we'll just log the notification
    
    console.log('Broadcast notification sent:', notificationData);
    
    return {
      success: true,
      message: 'Broadcast notification sent successfully'
    };
  } catch (error: unknown) {
    console.error('Broadcast notification error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to broadcast notification';
    return { success: false, error: errorMessage };
  }
}

// Get notification history
export async function getNotificationHistory(filters: Record<string, unknown>, currentUser: AuthenticatedUser): Promise<GetNotificationHistoryResult> {
  try {
    // Only authenticated users can get notification history
    if (!currentUser) {
      return { success: false, error: 'Authentication required' };
    }
    
    // Get Firebase services
    const { db } = await getFirebaseAdmin();
    if (!db) {
      return { success: false, error: 'Database not available' };
    }
    
    // Check permissions - only admins can get full notification history
    let query: FirebaseFirestore.Query = db.collection('notifications');
    
    if (!['admin', 'super-admin', 'chaplain'].includes(currentUser.role)) {
      // Regular users can only see notifications sent to them
      query = query.where('recipients', 'array-contains', currentUser.uid);
    }
    
    // Apply filters
    if (filters.senderId) {
      query = query.where('senderId', '==', filters.senderId as string);
    }
    
    // Order by sent date
    query = query.orderBy('sentAt', 'desc');
    
    // Apply pagination
    const page = (filters.page as number) || 1;
    const limit = (filters.limit as number) || 10;
    const offset = (page - 1) * limit;
    
    query = query.limit(limit).offset(offset);
    
    // Get notifications
    const notificationsSnapshot = await query.get();
    
    const notifications: Notification[] = notificationsSnapshot.docs.map((doc: FirebaseFirestore.QueryDocumentSnapshot) => {
      const data = doc.data() as Notification;
      return {
        ...data,
        id: doc.id
      };
    });
    
    // Get total count
    const totalSnapshot = await db.collection('notifications').get();
    const total = totalSnapshot.size;
    
    return {
      success: true,
      notifications,
      total
    };
  } catch (error: unknown) {
    console.error('Get notification history error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to get notification history';
    return { success: false, error: errorMessage };
  }
}