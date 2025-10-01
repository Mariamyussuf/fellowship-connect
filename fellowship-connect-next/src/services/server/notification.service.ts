import { Timestamp } from 'firebase/firestore';
import { getFirebaseAdmin } from '../../lib/firebase-admin';
import { BaseService } from './base.service';
import { Notification } from '../../types/database';

/**
 * Notification Service extending BaseService
 * Handles sending notifications via email, push, and in-app
 */
export class NotificationService extends BaseService<Notification> {
  constructor() {
    super('notifications');
  }

  /**
   * Send email notification
   * @param to Recipient email
   * @param subject Email subject
   * @param template Email template
   * @param data Template data
   * @returns Success status
   */
  async sendEmail(
    to: string,
    subject: string,
    template: string,
    data: Record<string, any>
  ): Promise<{ success: boolean; messageId?: string; message?: string }> {
    try {
      // In a real implementation, you would integrate with SendGrid, SES, or similar
      // For now, we'll simulate sending an email
      
      console.log(`Sending email to ${to} with subject "${subject}"`);
      console.log(`Template: ${template}`);
      console.log(`Data: ${JSON.stringify(data)}`);
      
      // Generate a mock message ID
      const messageId = `email_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Log audit action
      await this.logAudit('SEND_EMAIL', messageId, { to, subject, template });
      
      return { 
        success: true, 
        messageId 
      };
    } catch (error) {
      console.error('Send email error:', error);
      return { 
        success: false, 
        message: 'Failed to send email' 
      };
    }
  }

  /**
   * Send push notification via FCM
   * @param userId User ID
   * @param notification Notification data
   * @returns Success status
   */
  async sendPush(
    userId: string,
    notification: { title: string; body: string; data?: Record<string, any> }
  ): Promise<{ success: boolean; messageId?: string; message?: string }> {
    try {
      const { auth, db } = getFirebaseAdmin();
      
      // Get user's FCM tokens
      const tokensQuery = await db.collection('fcmTokens')
        .where('userId', '==', userId)
        .where('active', '==', true)
        .get();
      
      if (tokensQuery.empty) {
        return { 
          success: false, 
          message: 'No active FCM tokens found for user' 
        };
      }
      
      const tokens: string[] = [];
      tokensQuery.forEach((doc: any) => {
        tokens.push(doc.data().token);
      });
      
      // In a real implementation, you would use the FCM SDK to send notifications
      // For now, we'll simulate sending push notifications
      
      console.log(`Sending push notification to ${tokens.length} devices for user ${userId}`);
      console.log(`Notification: ${JSON.stringify(notification)}`);
      
      // Generate a mock message ID
      const messageId = `push_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Log audit action
      await this.logAudit('SEND_PUSH', messageId, { userId, notification });
      
      return { 
        success: true, 
        messageId 
      };
    } catch (error) {
      console.error('Send push notification error:', error);
      return { 
        success: false, 
        message: 'Failed to send push notification' 
      };
    }
  }

  /**
   * Send bulk notifications
   * @param userIds User IDs
   * @param notification Notification data
   * @returns Success status
   */
  async sendBulkNotifications(
    userIds: string[],
    notification: { title: string; body: string; type: string }
  ): Promise<{ success: boolean; sentCount?: number; message?: string }> {
    try {
      let sentCount = 0;
      
      // Send notification to each user
      for (const userId of userIds) {
        const result = await this.sendPush(userId, {
          title: notification.title,
          body: notification.body
        });
        
        if (result.success) {
          sentCount++;
        }
      }
      
      // Log audit action
      await this.logAudit('SEND_BULK_NOTIFICATIONS', 'system', { userIds, notification, sentCount });
      
      return { 
        success: true, 
        sentCount 
      };
    } catch (error) {
      console.error('Send bulk notifications error:', error);
      return { 
        success: false, 
        message: 'Failed to send bulk notifications' 
      };
    }
  }

  /**
   * Get notification history for a user
   * @param userId User ID
   * @param pagination Pagination parameters
   * @returns Notification history
   */
  async getNotificationHistory(
    userId: string,
    pagination: { limit?: number; lastDoc?: any } = {}
  ): Promise<{ success: boolean; notifications?: Notification[]; lastDoc?: any; message?: string }> {
    try {
      const { db } = getFirebaseAdmin();
      
      let query: any = db.collection('notifications')
        .where('userId', '==', userId)
        .orderBy('sentAt', 'desc');
      
      // Apply pagination
      if (pagination.limit) {
        query = query.limit(pagination.limit);
      }
      
      if (pagination.lastDoc) {
        query = query.startAfter(pagination.lastDoc);
      }
      
      const querySnapshot = await query.get();
      const notifications: Notification[] = [];
      
      querySnapshot.forEach((doc: any) => {
        notifications.push({ id: doc.id, ...(doc.data() as any) } as Notification);
      });
      
      const lastDoc = querySnapshot.docs[querySnapshot.docs.length - 1];
      
      // Log audit action
      await this.logAudit('GET_NOTIFICATION_HISTORY', userId, { pagination });
      
      return { 
        success: true, 
        notifications,
        lastDoc
      };
    } catch (error) {
      console.error('Get notification history error:', error);
      return { 
        success: false, 
        message: 'Failed to get notification history' 
      };
    }
  }

  /**
   * Mark notification as read
   * @param notificationId Notification ID
   * @returns Success status
   */
  async markAsRead(notificationId: string): Promise<{ success: boolean; message?: string }> {
    try {
      const { db } = getFirebaseAdmin();
      
      await db.collection('notifications').doc(notificationId).update({
        read: true,
        updatedAt: Timestamp.now()
      });
      
      // Log audit action
      await this.logAudit('MARK_NOTIFICATION_AS_READ', notificationId, {});
      
      return { 
        success: true, 
        message: 'Notification marked as read' 
      };
    } catch (error) {
      console.error('Mark notification as read error:', error);
      return { 
        success: false, 
        message: 'Failed to mark notification as read' 
      };
    }
  }

  /**
   * Get user notification preferences
   * @param userId User ID
   * @returns User preferences
   */
  async getUserPreferences(userId: string): Promise<{ success: boolean; preferences?: any; message?: string }> {
    try {
      const { db } = getFirebaseAdmin();
      
      const prefDoc = await db.collection('notificationPreferences').doc(userId).get();
      
      if (!prefDoc.exists) {
        // Return default preferences
        return { 
          success: true, 
          preferences: {
            email: true,
            push: true,
            sms: false
          }
        };
      }
      
      const preferences = prefDoc.data();
      
      // Log audit action
      await this.logAudit('GET_NOTIFICATION_PREFERENCES', userId, {});
      
      return { 
        success: true, 
        preferences 
      };
    } catch (error) {
      console.error('Get user preferences error:', error);
      return { 
        success: false, 
        message: 'Failed to get notification preferences' 
      };
    }
  }

  /**
   * Update user notification preferences
   * @param userId User ID
   * @param preferences New preferences
   * @returns Success status
   */
  async updatePreferences(
    userId: string,
    preferences: { email: boolean; push: boolean; sms: boolean }
  ): Promise<{ success: boolean; message?: string }> {
    try {
      const { db } = getFirebaseAdmin();
      
      await db.collection('notificationPreferences').doc(userId).set({
        ...preferences,
        userId,
        updatedAt: Timestamp.now()
      });
      
      // Log audit action
      await this.logAudit('UPDATE_NOTIFICATION_PREFERENCES', userId, preferences);
      
      return { 
        success: true, 
        message: 'Notification preferences updated successfully' 
      };
    } catch (error) {
      console.error('Update preferences error:', error);
      return { 
        success: false, 
        message: 'Failed to update notification preferences' 
      };
    }
  }
}