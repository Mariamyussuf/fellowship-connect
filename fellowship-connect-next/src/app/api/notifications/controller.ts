import { db } from '@/lib/firebaseAdmin';
import { sendNotificationSchema, broadcastNotificationSchema } from '@/lib/schemas';
import { AuthenticatedUser } from '@/lib/authMiddleware';

// Send notification
export async function sendNotification(data: any, currentUser: AuthenticatedUser): Promise<{ success: boolean; message?: string; error?: string }> {
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
    
    // Create notification record in Firestore
    const notificationData = {
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
  } catch (error: any) {
    console.error('Send notification error:', error);
    return { success: false, error: error.message || 'Failed to send notification' };
  }
}

// Broadcast notification
export async function broadcastNotification(data: any, currentUser: AuthenticatedUser): Promise<{ success: boolean; message?: string; error?: string }> {
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
    
    // Create notification record in Firestore
    const notificationData = {
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
  } catch (error: any) {
    console.error('Broadcast notification error:', error);
    return { success: false, error: error.message || 'Failed to broadcast notification' };
  }
}

// Get notification history
export async function getNotificationHistory(filters: any, currentUser: AuthenticatedUser): Promise<{ success: boolean; message?: string; error?: string; notifications?: any[]; total?: number }> {
  try {
    // Only authenticated users can get notification history
    if (!currentUser) {
      return { success: false, error: 'Authentication required' };
    }
    
    // Check permissions - only admins can get full notification history
    let query: any = db.collection('notifications');
    
    if (!['admin', 'super-admin', 'chaplain'].includes(currentUser.role)) {
      // Regular users can only see notifications sent to them
      query = query.where('recipients', 'array-contains', currentUser.uid);
    }
    
    // Apply filters
    if (filters.senderId) {
      query = query.where('senderId', '==', filters.senderId);
    }
    
    // Order by sent date
    query = query.orderBy('sentAt', 'desc');
    
    // Apply pagination
    const page = filters.page || 1;
    const limit = filters.limit || 10;
    const offset = (page - 1) * limit;
    
    query = query.limit(limit).offset(offset);
    
    // Get notifications
    const notificationsSnapshot = await query.get();
    
    const notifications = notificationsSnapshot.docs.map((doc: any) => ({
      id: doc.id,
      ...doc.data()
    }));
    
    // Get total count
    const totalSnapshot = await db.collection('notifications').get();
    const total = totalSnapshot.size;
    
    return {
      success: true,
      notifications,
      total
    };
  } catch (error: any) {
    console.error('Get notification history error:', error);
    return { success: false, error: error.message || 'Failed to get notification history' };
  }
}