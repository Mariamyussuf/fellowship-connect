import { CollectionReference, DocumentData, Query, QuerySnapshot, Timestamp, collection, doc, getDoc, getDocs, query, setDoc, updateDoc, deleteDoc, where, orderBy, limit, startAfter, writeBatch } from 'firebase/firestore';
import { getFirebaseAdmin } from '../../lib/firebase-admin';
import { AuditLog } from '../../types/database';

// Type for Firebase Admin Firestore
type AdminFirestore = ReturnType<typeof getFirebaseAdmin>['db'];

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
    this.db = db;
    this.collectionName = collectionName;
    this.collectionRef = collection(db as any, collectionName) as CollectionReference<T>;
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

      let docRef;
      if (id) {
        docRef = doc(this.collectionRef, id);
        await setDoc(docRef, documentData);
        return docRef.id;
      } else {
        docRef = await setDoc(doc(this.collectionRef), documentData);
        // For Firebase Admin, setDoc returns void, so we return the id from the collection ref
        return id || 'unknown';
      }

      // Log audit action
      await this.logAudit('CREATE', id || 'unknown', documentData);

      return id || 'generated-id';
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
      const docRef = doc(this.collectionRef, id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as T;
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
      const docRef = doc(this.collectionRef, id);
      const updateData = {
        ...data,
        updatedAt: Timestamp.now()
      };
      
      await updateDoc(docRef, updateData);
      
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
      const docRef = doc(this.collectionRef, id);
      
      // Soft delete by setting deleted flag and deletedAt timestamp
      await updateDoc(docRef, {
        deleted: true,
        deletedAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });
      
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
      const docRef = doc(this.collectionRef, id);
      await deleteDoc(docRef);
      
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
      let q: Query<T> = query(this.collectionRef, orderBy('createdAt', 'desc'), limit(limitCount));
      
      // Apply filters
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          q = query(q, where(key, '==', value));
        }
      });
      
      // Apply pagination
      if (lastDoc) {
        q = query(q, startAfter(lastDoc));
      }
      
      const querySnapshot: QuerySnapshot<T> = await getDocs(q);
      const data: T[] = [];
      
      querySnapshot.forEach((doc) => {
        data.push({ id: doc.id, ...doc.data() });
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
      const q = query(this.collectionRef, where(field, '==', value));
      const querySnapshot = await getDocs(q);
      const data: T[] = [];
      
      querySnapshot.forEach((doc) => {
        data.push({ id: doc.id, ...doc.data() });
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
      const auditCollection = collection(this.db as any, 'auditLogs');
      const auditLog: AuditLog = {
        action,
        userId: 'system', // This would typically come from the authenticated user
        resourceType: this.collectionName,
        resourceId,
        changes: JSON.stringify(changes),
        timestamp: new Date().toISOString(),
        ipAddress: 'unknown' // This would typically come from the request
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
   * Execute operations in a transaction
   * @param operation Function that performs the transactional operations
   */
  async runTransaction(operation: (batch: any) => Promise<void>): Promise<void> {
    try {
      const batch = writeBatch(this.db as any);
      await operation(batch);
      await batch.commit();
    } catch (error) {
      console.error(`Error running transaction for ${this.collectionName}:`, error);
      throw new Error(`Transaction failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}