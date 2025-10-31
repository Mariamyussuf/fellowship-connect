import { Timestamp } from 'firebase/firestore';
import { getFirebaseAdmin } from '../../lib/firebase-admin';
import { BaseService } from './base.service';
import { Media } from '../../types/database';
import { DocumentData, QueryDocumentSnapshot } from 'firebase-admin/firestore';

/**
 * Media Service extending BaseService
 * Handles media file uploads, management, and retrieval
 */
export class MediaService extends BaseService<Media> {
  constructor() {
    super('media');
  }

  /**
   * Upload a file to Firebase Storage and save metadata to Firestore
   * @param file File data
   * @param userId User ID of uploader
   * @param category File category
   * @returns Media item result
   */
  async uploadFile(
    file: { name: string; type: string; size: number; buffer: Buffer },
    userId: string,
    category: string
  ): Promise<{ success: boolean; mediaId?: string; url?: string; message?: string }> {
    try {
      const { storage, db } = getFirebaseAdmin();
      
      // Validate file type and size
      const validationResult = this.validateFile(file);
      if (!validationResult.isValid) {
        return { 
          success: false, 
          message: validationResult.error 
        };
      }
      
      // Generate file path
      const fileName = `${Date.now()}-${file.name}`;
      const filePath = `media/${category}/${fileName}`;
      
      // Upload file to Firebase Storage
      const bucket = storage.bucket();
      const fileRef = bucket.file(filePath);
      
      await fileRef.save(file.buffer, {
        metadata: {
          contentType: file.type,
          cacheControl: 'public, max-age=31536000' // 1 year
        }
      });
      
      // Get download URL
      const [url] = await fileRef.getSignedUrl({
        action: 'read',
        expires: '03-01-2500' // Far future expiration
      });
      
      // Save metadata to Firestore
      const mediaData: Media = {
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
        storageUrl: url,
        uploadedBy: userId,
        createdAt: new Date().toISOString()
      };
      
      const docRef = await db.collection('media').add({
        ...mediaData,
        createdAt: Timestamp.now()
      });
      
      // Log audit action
      await this.logAudit('UPLOAD_FILE', docRef.id, mediaData);
      
      return { 
        success: true, 
        mediaId: docRef.id,
        url
      };
    } catch (error) {
      console.error('Upload file error:', error);
      return { 
        success: false, 
        message: 'Failed to upload file' 
      };
    }
  }

  /**
   * Validate file type and size
   * @param file File to validate
   * @returns Validation result
   */
  validateFile(file: { name: string; type: string; size: number }): { isValid: boolean; error?: string } {
    // Check file size (100MB max for most files, 10MB for images)
    const maxSize = file.type.startsWith('image/') ? 10 * 1024 * 1024 : 100 * 1024 * 1024;
    if (file.size > maxSize) {
      return { 
        isValid: false, 
        error: `File size exceeds limit (${maxSize / (1024 * 1024)}MB)` 
      };
    }
    
    // Check file type
    const allowedTypes = [
      // Images
      'image/jpeg', 'image/png', 'image/gif', 'image/webp',
      // Audio
      'audio/mpeg', 'audio/wav', 'audio/ogg',
      // Video
      'video/mp4', 'video/webm', 'video/ogg',
      // Documents
      'application/pdf', 'application/msword', 
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel', 
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/plain'
    ];
    
    if (!allowedTypes.includes(file.type)) {
      return { 
        isValid: false, 
        error: 'File type not allowed' 
      };
    }
    
    return { isValid: true };
  }

  /**
   * Get signed URL for file download
   * @param fileId Media file ID
   * @param expiryMinutes Expiry time in minutes
   * @returns Signed URL
   */
  async getSignedUrl(
    fileId: string,
    expiryMinutes: number = 60
  ): Promise<{ success: boolean; url?: string; message?: string }> {
    try {
      const { storage, db } = getFirebaseAdmin();
      
      // Get media document
      const mediaDoc = await db.collection('media').doc(fileId).get();
      
      if (!mediaDoc.exists) {
        return { 
          success: false, 
          message: 'File not found' 
        };
      }
      
      const mediaData = mediaDoc.data() as Media;
      
      // Get file from storage
      const bucket = storage.bucket();
      const fileRef = bucket.file(`media/${mediaData.fileType.split('/')[0]}/${mediaData.fileName}`);
      
      // Generate signed URL
      const expires = new Date();
      expires.setMinutes(expires.getMinutes() + expiryMinutes);
      
      const [url] = await fileRef.getSignedUrl({
        action: 'read',
        expires: expires
      });
      
      // Log audit action
      await this.logAudit('GET_SIGNED_URL', fileId, { expiryMinutes });
      
      return { 
        success: true, 
        url 
      };
    } catch (error) {
      console.error('Get signed URL error:', error);
      return { 
        success: false, 
        message: 'Failed to generate download URL' 
      };
    }
  }

  /**
   * Delete file from storage and Firestore
   * @param fileId Media file ID
   * @returns Success status
   */
  async deleteFile(fileId: string): Promise<{ success: boolean; message?: string }> {
    try {
      const { storage, db } = getFirebaseAdmin();
      
      // Get media document
      const mediaDoc = await db.collection('media').doc(fileId).get();
      
      if (!mediaDoc.exists) {
        return { 
          success: false, 
          message: 'File not found' 
        };
      }
      
      const mediaData = mediaDoc.data() as Media;
      
      // Delete file from storage
      const bucket = storage.bucket();
      const fileRef = bucket.file(`media/${mediaData.fileType.split('/')[0]}/${mediaData.fileName}`);
      await fileRef.delete();
      
      // Delete document from Firestore
      await db.collection('media').doc(fileId).delete();
      
      // Log audit action
      await this.logAudit('DELETE_FILE', fileId, {});
      
      return { 
        success: true, 
        message: 'File deleted successfully' 
      };
    } catch (error) {
      console.error('Delete file error:', error);
      return { 
        success: false, 
        message: 'Failed to delete file' 
      };
    }
  }

  /**
   * List media files with filtering and pagination
   * @param filters Filters to apply
   * @param pagination Pagination parameters
   * @returns Media files
   */
  async listMedia(
    filters: { category?: string; uploadedBy?: string } = {},
    pagination: { limit?: number; lastDoc?: QueryDocumentSnapshot<DocumentData> } = {}
  ): Promise<{ success: boolean; media?: Media[]; lastDoc?: QueryDocumentSnapshot<DocumentData>; message?: string }> {
    try {
      const { db } = getFirebaseAdmin();
      
      let query: FirebaseFirestore.Query = db.collection('media').orderBy('createdAt', 'desc');
      
      // Apply filters
      if (filters.category) {
        query = query.where('fileType', '==', filters.category);
      }
      
      if (filters.uploadedBy) {
        query = query.where('uploadedBy', '==', filters.uploadedBy);
      }
      
      // Apply pagination
      if (pagination.limit) {
        query = query.limit(pagination.limit);
      }
      
      if (pagination.lastDoc) {
        query = query.startAfter(pagination.lastDoc);
      }
      
      const querySnapshot = await query.get();
      const media: Media[] = [];
      
      querySnapshot.forEach((doc: QueryDocumentSnapshot<DocumentData>) => {
        media.push({ id: doc.id, ...(doc.data() as Media) } as Media);
      });
      
      const lastDoc = querySnapshot.docs[querySnapshot.docs.length - 1];
      
      // Log audit action
      await this.logAudit('LIST_MEDIA', 'user', { filters, pagination });
      
      return { 
        success: true, 
        media,
        lastDoc
      };
    } catch (error) {
      console.error('List media error:', error);
      return { 
        success: false, 
        message: 'Failed to list media files' 
      };
    }
  }

  /**
   * Update media metadata
   * @param fileId Media file ID
   * @param metadata Metadata to update
   * @returns Success status
   */
  async updateMetadata(
    fileId: string,
    metadata: { title?: string; description?: string }
  ): Promise<{ success: boolean; message?: string }> {
    try {
      const { db } = getFirebaseAdmin();
      
      await db.collection('media').doc(fileId).update({
        ...metadata,
        updatedAt: Timestamp.now()
      });
      
      // Log audit action
      await this.logAudit('UPDATE_MEDIA_METADATA', fileId, metadata);
      
      return { 
        success: true, 
        message: 'Media metadata updated successfully' 
      };
    } catch (error) {
      console.error('Update media metadata error:', error);
      return { 
        success: false, 
        message: 'Failed to update media metadata' 
      };
    }
  }

  /**
   * Scan file for viruses (placeholder implementation)
   * @param file File to scan
   * @returns Scan result
   */
  async scanForVirus(file: { buffer: Buffer }): Promise<{ isSafe: boolean; message?: string }> {
    // Placeholder implementation - in a real app, you would integrate with a virus scanning service
    console.log('Scanning file for viruses (placeholder implementation)');
    
    // Log audit action
    await this.logAudit('VIRUS_SCAN', 'system', { fileSize: file.buffer.length });
    
    // For now, assume all files are safe
    return { 
      isSafe: true, 
      message: 'File scan completed (placeholder)' 
    };
  }
}