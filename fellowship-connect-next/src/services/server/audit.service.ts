import { Timestamp, collection, doc, setDoc, query, where, orderBy, limit, getDocs, getDoc, startAfter } from 'firebase/firestore';
import { getFirebaseAdmin } from '../../lib/firebase-admin';
import { AuditLog } from '../../types/database';

/**
 * Audit Service for comprehensive audit logging
 */
export class AuditService {
  private db: any;

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
    details: Record<string, any> = {},
    ipAddress: string = 'unknown'
  ): Promise<void> {
    try {
      const auditCollection = collection(this.db, 'auditLogs');
      const auditLog: AuditLog = {
        action,
        userId,
        resourceType: resource,
        resourceId: details.resourceId || 'N/A',
        changes: JSON.stringify(details),
        timestamp: new Date().toISOString(),
        ipAddress
      };

      await setDoc(doc(auditCollection), {
        ...auditLog,
        createdAt: Timestamp.now()
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
    before: Record<string, any>,
    after: Record<string, any>,
    userId: string,
    ipAddress: string = 'unknown'
  ): Promise<void> {
    const changes: Record<string, { before: any; after: any }> = {};
    
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
    details: Record<string, any> = {},
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
    lastDoc: any = null
  ): Promise<{ logs: AuditLog[]; lastDoc: any }> {
    try {
      let q: any = query(
        collection(this.db, 'auditLogs'),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );

      // Apply filters
      if (filters.action) {
        q = query(q, where('action', '==', filters.action));
      }

      if (filters.userId) {
        q = query(q, where('userId', '==', filters.userId));
      }

      if (filters.resourceType) {
        q = query(q, where('resourceType', '==', filters.resourceType));
      }

      if (filters.startDate) {
        q = query(q, where('createdAt', '>=', new Date(filters.startDate)));
      }

      if (filters.endDate) {
        q = query(q, where('createdAt', '<=', new Date(filters.endDate)));
      }

      // Apply pagination
      if (lastDoc) {
        const lastDocSnapshot = await getDoc(doc(this.db, 'auditLogs', lastDoc.id));
        if (lastDocSnapshot.exists()) {
          q = query(q, startAfter(lastDocSnapshot));
        }
      }

      const querySnapshot = await getDocs(q);
      const logs: AuditLog[] = [];

      querySnapshot.forEach((docSnapshot) => {
        const data: any = docSnapshot.data();
        logs.push({
          id: docSnapshot.id,
          action: data.action,
          userId: data.userId,
          resourceType: data.resourceType,
          resourceId: data.resourceId,
          changes: data.changes,
          timestamp: data.timestamp,
          ipAddress: data.ipAddress
        } as AuditLog);
      });

      const lastVisible = querySnapshot.docs[querySnapshot.docs.length - 1];

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