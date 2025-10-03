import { CollectionReference, DocumentData, Query, QuerySnapshot, Timestamp, DocumentReference, QueryDocumentSnapshot, WriteBatch } from 'firebase-admin/firestore';
import { getFirebaseAdmin } from '../../lib/firebase-admin';
import { AuditLog } from '../../types/database';

// Type for Firebase Admin Firestore
type AdminFirestore = NonNullable<ReturnType<typeof getFirebaseAdmin>['db']>;

/**
 * Abstract BaseService class that all services extend
 * Provides common functionality for Firebase Firestore operations
 */
export abstract class BaseService<T extends DocumentData> {
  protected db: AdminFirestore;
  protected collectionName: string;
  protected collectionRef: CollectionReference<T>;

  constructor(collectionName: string) {
    const { db } = getFirebaseAdmin();
    this.db = db!;
    this.collectionName = collectionName;
    this.collectionRef = this.db.collection(collectionName) as CollectionReference<T>;
  }

  /**
   * Create a new document in the collection
   * @param data The data to create
   * @param id Optional document ID, auto-generated if not provided
   * @returns The created document ID
   */
  async create(data: Partial<T>, id?: string): Promise<string> {
    try {
      const timestamp = Timestamp.now();
      const documentData: any = {
        ...data,
        createdAt: timestamp,
        updatedAt: timestamp
      };

      let docRef: DocumentReference<T>;
      if (id) {
        docRef = this.collectionRef.doc(id);
        await docRef.set(documentData);
        return docRef.id;
      } else {
        docRef = await this.collectionRef.add(documentData);
        return docRef.id;
      }

      // Log audit action
      await this.logAudit('CREATE', id || docRef.id, documentData);

      return docRef.id;
    } catch (error) {
      console.error(`Error creating document in ${this.collectionName}:`, error);
      throw new Error(`Failed to create document: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Get a document by ID
   * @param id Document ID
   * @returns The document data or null if not found
   */
  async getById(id: string): Promise<T | null> {
    try {
      const docRef = this.collectionRef.doc(id);
      const docSnap = await docRef.get();
      
      if (docSnap.exists) {
        return { id: docSnap.id, ...docSnap.data() } as unknown as T;
      }
      
      return null;
    } catch (error) {
      console.error(`Error getting document ${id} from ${this.collectionName}:`, error);
      throw new Error(`Failed to get document: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Update a document by ID
   * @param id Document ID
   * @param data Data to update
   * @returns Boolean indicating success
   */
  async update(id: string, data: Partial<T>): Promise<boolean> {
    try {
      const docRef = this.collectionRef.doc(id);
      const updateData: any = {
        ...data,
        updatedAt: Timestamp.now()
      };
      
      await docRef.update(updateData);
      
      // Log audit action
      await this.logAudit('UPDATE', id, data);
      
      return true;
    } catch (error) {
      console.error(`Error updating document ${id} in ${this.collectionName}:`, error);
      throw new Error(`Failed to update document: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Delete a document by ID (soft delete)
   * @param id Document ID
   * @returns Boolean indicating success
   */
  async delete(id: string): Promise<boolean> {
    try {
      const docRef = this.collectionRef.doc(id);
      
      // Soft delete by setting deleted flag and deletedAt timestamp
      await docRef.update({
        deleted: true,
        deletedAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      } as any);
      
      // Log audit action
      await this.logAudit('DELETE', id, {});
      
      return true;
    } catch (error) {
      console.error(`Error deleting document ${id} from ${this.collectionName}:`, error);
      throw new Error(`Failed to delete document: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Hard delete a document by ID
   * @param id Document ID
   * @returns Boolean indicating success
   */
  async hardDelete(id: string): Promise<boolean> {
    try {
      const docRef = this.collectionRef.doc(id);
      await docRef.delete();
      
      // Log audit action
      await this.logAudit('HARD_DELETE', id, {});
      
      return true;
    } catch (error) {
      console.error(`Error hard deleting document ${id} from ${this.collectionName}:`, error);
      throw new Error(`Failed to hard delete document: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * List documents with optional filtering and pagination
   * @param filters Optional filters to apply
   * @param limitCount Number of documents to return
   * @param lastDoc Last document for pagination
   * @returns Array of documents
   */
  async list(
    filters: Record<string, any> = {},
    limitCount: number = 20,
    lastDoc: any = null
  ): Promise<{ data: T[]; lastDoc: any }> {
    try {
      let query = this.collectionRef.orderBy('createdAt', 'desc').limit(limitCount);
      
      // Apply filters
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          query = query.where(key, '==', value);
        }
      });
      
      // Apply pagination
      if (lastDoc) {
        query = query.startAfter(lastDoc);
      }
      
      const querySnapshot = await query.get();
      const data: T[] = [];
      
      querySnapshot.forEach((doc) => {
        data.push({ id: doc.id, ...doc.data() } as unknown as T);
      });
      
      const lastVisible = querySnapshot.docs[querySnapshot.docs.length - 1];
      
      return { data, lastDoc: lastVisible };
    } catch (error) {
      console.error(`Error listing documents from ${this.collectionName}:`, error);
      throw new Error(`Failed to list documents: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Find documents by a specific field value
   * @param field Field name to search by
   * @param value Field value to match
   * @returns Array of matching documents
   */
  async findByField(field: string, value: any): Promise<T[]> {
    try {
      const query = this.collectionRef.where(field, '==', value);
      const querySnapshot = await query.get();
      const data: T[] = [];
      
      querySnapshot.forEach((doc) => {
        data.push({ id: doc.id, ...doc.data() } as unknown as T);
      });
      
      return data;
    } catch (error) {
      console.error(`Error finding documents by ${field} in ${this.collectionName}:`, error);
      throw new Error(`Failed to find documents: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Log audit action
   * @param action Action performed (CREATE, UPDATE, DELETE, etc.)
   * @param resourceId ID of the resource affected
   * @param changes Changes made
   */
  protected async logAudit(
    action: string,
    resourceId: string,
    changes: Record<string, any>
  ): Promise<void> {
    try {
      const auditCollection = this.db.collection('auditLogs');
      const auditLog: AuditLog = {
        action,
        userId: 'system', // This would typically come from the authenticated user
        resourceType: this.collectionName,
        resourceId,
        changes: JSON.stringify(changes),
        timestamp: new Date().toISOString(),
        ipAddress: 'unknown' // This would typically come from the request
      };
      
      await auditCollection.add({
        ...auditLog,
        createdAt: Timestamp.now()
      });
    } catch (error) {
      console.error('Error logging audit action:', error);
      // Don't throw error as audit logging failure shouldn't break the main operation
    }
  }

  /**
   * Execute operations in a transaction
   * @param operation Function that performs the transactional operations
   */
  async runTransaction(operation: (batch: WriteBatch) => Promise<void>): Promise<void> {
    try {
      const batch = this.db.batch();
      await operation(batch);
      await batch.commit();
    } catch (error) {
      console.error(`Error running transaction for ${this.collectionName}:`, error);
      throw new Error(`Transaction failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}