import { getFirebaseAdmin } from '../../lib/firebase-admin';
import { AuditLog } from '../../types/database';
import type FirebaseFirestore from 'firebase-admin/firestore';

/**
 * Audit Service for comprehensive audit logging
 */
export class AuditService {
  private db: FirebaseFirestore.Firestore;

  constructor() {
    const { db } = getFirebaseAdmin();
    this.db = db;
  }

  /**
   * Log a general action
   * @param action Action performed
   * @param userId ID of the user performing the action
   * @param resource Resource affected
   * @param details Additional details
   * @param ipAddress IP address of the request
   */
  async logAction(
    action: string,
    userId: string,
    resource: string,
    details: Record<string, unknown> = {},
    ipAddress: string = 'unknown'
  ): Promise<void> {
    try {
      const auditCollection = this.db.collection('auditLogs');
      const auditLog: AuditLog = {
        action,
        userId,
        resourceType: resource,
        resourceId: (details.resourceId as string) || 'N/A',
        changes: JSON.stringify(details),
        timestamp: new Date().toISOString(),
        ipAddress
      };

      await auditCollection.add({
        ...auditLog,
        createdAt: new Date()
      });
    } catch (error) {
      console.error('Error logging audit action:', error);
      // Don't throw error as audit logging failure shouldn't break the main operation
    }
  }

  /**
   * Log an authentication event
   * @param event Authentication event (login, logout, failed_login, etc.)
   * @param userId ID of the user
   * @param success Whether the authentication was successful
   * @param ipAddress IP address of the request
   */
  async logAuthEvent(
    event: string,
    userId: string,
    success: boolean,
    ipAddress: string = 'unknown'
  ): Promise<void> {
    await this.logAction(
      `AUTH_${event.toUpperCase()}`,
      userId,
      'authentication',
      { success, event },
      ipAddress
    );
  }

  /**
   * Log a data change
   * @param collection Collection name
   * @param documentId Document ID
   * @param before State before change
   * @param after State after change
   * @param userId ID of the user making the change
   * @param ipAddress IP address of the request
   */
  async logDataChange(
    collection: string,
    documentId: string,
    before: Record<string, unknown>,
    after: Record<string, unknown>,
    userId: string,
    ipAddress: string = 'unknown'
  ): Promise<void> {
    const changes: Record<string, { before: unknown; after: unknown }> = {};
    
    // Find what changed
    const allKeys = new Set([...Object.keys(before), ...Object.keys(after)]);
    for (const key of allKeys) {
      if (JSON.stringify(before[key]) !== JSON.stringify(after[key])) {
        changes[key] = {
          before: before[key],
          after: after[key]
        };
      }
    }

    await this.logAction(
      'DATA_CHANGE',
      userId,
      collection,
      { 
        documentId, 
        changes,
        summary: `Changed ${Object.keys(changes).length} fields`
      },
      ipAddress
    );
  }

  /**
   * Log an admin action
   * @param action Admin action performed
   * @param adminId ID of the admin user
   * @param target Target of the action
   * @param details Additional details
   * @param ipAddress IP address of the request
   */
  async logAdminAction(
    action: string,
    adminId: string,
    target: string,
    details: Record<string, unknown> = {},
    ipAddress: string = 'unknown'
  ): Promise<void> {
    await this.logAction(
      `ADMIN_${action.toUpperCase()}`,
      adminId,
      'admin',
      { target, ...details },
      ipAddress
    );
  }

  /**
   * Get audit logs with filtering and pagination
   * @param filters Filters to apply
   * @param limitCount Number of logs to return
   * @param lastDoc Last document for pagination
   * @returns Audit logs
   */
  async getAuditLogs(
    filters: {
      action?: string;
      userId?: string;
      resourceType?: string;
      startDate?: string;
      endDate?: string;
    } = {},
    limitCount: number = 50,
    lastDoc: FirebaseFirestore.QueryDocumentSnapshot | null = null
  ): Promise<{ logs: AuditLog[]; lastDoc: FirebaseFirestore.QueryDocumentSnapshot | null }> {
    try {
      let q: FirebaseFirestore.Query = this.db.collection('auditLogs')
        .orderBy('createdAt', 'desc')
        .limit(limitCount);

      // Apply filters
      if (filters.action) {
        q = q.where('action', '==', filters.action);
      }

      if (filters.userId) {
        q = q.where('userId', '==', filters.userId);
      }

      if (filters.resourceType) {
        q = q.where('resourceType', '==', filters.resourceType);
      }

      if (filters.startDate) {
        q = q.where('createdAt', '>=', new Date(filters.startDate));
      }

      if (filters.endDate) {
        q = q.where('createdAt', '<=', new Date(filters.endDate));
      }

      // Apply pagination
      if (lastDoc) {
        q = q.startAfter(lastDoc);
      }

      const querySnapshot = await q.get();
      const logs: AuditLog[] = [];

      querySnapshot.forEach((docSnapshot) => {
        const data = docSnapshot.data();
        logs.push({
          id: docSnapshot.id,
          action: data.action,
          userId: data.userId,
          resourceType: data.resourceType,
          resourceId: data.resourceId,
          changes: data.changes,
          timestamp: data.timestamp,
          ipAddress: data.ipAddress
        });
      });

      const lastVisible = querySnapshot.docs[querySnapshot.docs.length - 1] || null;

      return { logs, lastDoc: lastVisible };
    } catch (error) {
      console.error('Error getting audit logs:', error);
      throw new Error(`Failed to get audit logs: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Export audit logs
   * @param filters Filters to apply
   * @param format Export format
   * @returns Exported data
   */
  async exportAuditLogs(
    filters: {
      startDate?: string;
      endDate?: string;
    } = {},
    format: 'csv' | 'json' = 'json'
  ): Promise<string> {
    try {
      const { logs } = await this.getAuditLogs(filters, 1000); // Limit to 1000 logs for export

      if (format === 'json') {
        return JSON.stringify(logs, null, 2);
      } else {
        // CSV format
        if (logs.length === 0) {
          return '';
        }

        const headers = ['timestamp', 'action', 'userId', 'resourceType', 'resourceId', 'ipAddress'];
        const rows = logs.map(log => [
          log.timestamp,
          log.action,
          log.userId,
          log.resourceType,
          log.resourceId,
          log.ipAddress
        ]);

        return [
          headers.join(','),
          ...rows.map(row => row.map(field => `"${String(field).replace(/"/g, '""')}"`).join(','))
        ].join('\n');
      }
    } catch (error) {
      console.error('Error exporting audit logs:', error);
      throw new Error(`Failed to export audit logs: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}