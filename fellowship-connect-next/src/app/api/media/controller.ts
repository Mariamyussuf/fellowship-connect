import { db, storage } from '@/lib/firebaseAdmin';
import { uploadMediaSchema } from '@/lib/schemas';
import { AuthenticatedUser } from '@/lib/authMiddleware';

// Upload media
export async function uploadMedia(data: any, currentUser: AuthenticatedUser): Promise<{ success: boolean; message?: string; error?: string; media?: any }> {
  try {
    // Validate input
    const validatedData = uploadMediaSchema.parse(data);
    
    // Only authenticated users can upload media
    if (!currentUser) {
      return { success: false, error: 'Authentication required' };
    }
    
    // Create media record in Firestore
    const mediaData = {
      fileName: validatedData.fileName,
      fileType: validatedData.fileType,
      fileSize: validatedData.fileSize,
      userId: currentUser.uid,
      userEmail: currentUser.email || '',
      userFullName: currentUser.customClaims?.name || '',
      uploadedAt: new Date().toISOString(),
      isPublic: false, // Default to private
      downloadCount: 0
    };
    
    const mediaRef = await db.collection('media').add(mediaData);
    
    // Generate signed URL for upload
    const bucket = storage.bucket();
    const file = bucket.file(`media/${mediaRef.id}/${validatedData.fileName}`);
    
    // In a real implementation, you would generate a signed URL for upload
    // For now, we'll just return the media record
    const signedUrl = ''; // Placeholder
    
    return {
      success: true,
      message: 'Media upload initiated successfully',
      media: {
        id: mediaRef.id,
        ...mediaData,
        uploadUrl: signedUrl
      }
    };
  } catch (error: any) {
    console.error('Upload media error:', error);
    return { success: false, error: error.message || 'Failed to upload media' };
  }
}

// Get download URL
export async function getDownloadUrl(mediaId: string, currentUser: AuthenticatedUser): Promise<{ success: boolean; message?: string; error?: string; downloadUrl?: string }> {
  try {
    // Only authenticated users can get download URLs
    if (!currentUser) {
      return { success: false, error: 'Authentication required' };
    }
    
    // Get media record from Firestore
    const mediaDoc = await db.collection('media').doc(mediaId).get();
    
    if (!mediaDoc.exists) {
      return { success: false, error: 'Media not found' };
    }
    
    const mediaData = mediaDoc.data();
    
    // Check permissions - users can only download their own media or public media
    if (mediaData?.userId !== currentUser.uid && !mediaData?.isPublic) {
      // Admins can download any media
      if (!['admin', 'super-admin', 'chaplain'].includes(currentUser.role)) {
        return { success: false, error: 'Insufficient permissions' };
      }
    }
    
    // Generate signed URL for download
    const bucket = storage.bucket();
    const file = bucket.file(`media/${mediaId}/${mediaData?.fileName}`);
    
    const downloadUrl = ''; // Placeholder
    
    // Update download count
    await db.collection('media').doc(mediaId).update({
      downloadCount: (mediaData?.downloadCount || 0) + 1
    });
    
    return {
      success: true,
      downloadUrl
    };
  } catch (error: any) {
    console.error('Get download URL error:', error);
    return { success: false, error: error.message || 'Failed to get download URL' };
  }
}

// Delete media
export async function deleteMedia(mediaId: string, currentUser: AuthenticatedUser): Promise<{ success: boolean; message?: string; error?: string }> {
  try {
    // Only authenticated users can delete media
    if (!currentUser) {
      return { success: false, error: 'Authentication required' };
    }
    
    // Get media record from Firestore
    const mediaDoc = await db.collection('media').doc(mediaId).get();
    
    if (!mediaDoc.exists) {
      return { success: false, error: 'Media not found' };
    }
    
    const mediaData = mediaDoc.data();
    
    // Check permissions - users can only delete their own media or admins can delete any
    if (mediaData?.userId !== currentUser.uid && !['admin', 'super-admin', 'chaplain'].includes(currentUser.role)) {
      return { success: false, error: 'Insufficient permissions' };
    }
    
    // Delete file from storage
    const bucket = storage.bucket();
    const file = bucket.file(`media/${mediaId}/${mediaData?.fileName}`);
    await file.delete();
    
    // Delete media record from Firestore
    await db.collection('media').doc(mediaId).delete();
    
    return {
      success: true,
      message: 'Media deleted successfully'
    };
  } catch (error: any) {
    console.error('Delete media error:', error);
    return { success: false, error: error.message || 'Failed to delete media' };
  }
}

// List media
export async function listMedia(filters: any, currentUser: AuthenticatedUser): Promise<{ success: boolean; message?: string; error?: string; media?: any[]; total?: number }> {
  try {
    // Only authenticated users can list media
    if (!currentUser) {
      return { success: false, error: 'Authentication required' };
    }
    
    // Build query based on filters
    let query: any = db.collection('media');
    
    // Filter by user (if not admin, only show own media or public media)
    if (!['admin', 'super-admin', 'chaplain'].includes(currentUser.role)) {
      query = query.where('userId', '==', currentUser.uid);
    }
    
    // Filter by public visibility
    if (!['admin', 'super-admin', 'chaplain'].includes(currentUser.role)) {
      query = query.where('isPublic', '==', true);
    }
    
    // Order by upload date
    query = query.orderBy('uploadedAt', 'desc');
    
    // Apply pagination
    const page = filters.page || 1;
    const limit = filters.limit || 10;
    const offset = (page - 1) * limit;
    
    query = query.limit(limit).offset(offset);
    
    // Get media records
    const mediaSnapshot = await query.get();
    
    const media = mediaSnapshot.docs.map((doc: any) => ({
      id: doc.id,
      ...doc.data()
    }));
    
    // Get total count
    const totalSnapshot = await db.collection('media').get();
    const total = totalSnapshot.size;
    
    return {
      success: true,
      media,
      total
    };
  } catch (error: any) {
    console.error('List media error:', error);
    return { success: false, error: error.message || 'Failed to list media' };
  }
}