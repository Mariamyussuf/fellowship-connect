import { 
  ref, 
  getDownloadURL, 
  deleteObject,
  listAll,
  uploadBytesResumable,
  type UploadTaskSnapshot 
} from 'firebase/storage';
import { storage } from './config';

// Type for tracking upload progress
export interface UploadProgress {
  progress: number;
  downloadURL?: string;
  error?: Error;
}

// Upload a file to Firebase Storage
export const uploadFile = async (
  path: string, 
  file: File,
  onProgress?: (snapshot: UploadTaskSnapshot) => void
): Promise<string> => {
  try {
    const storageRef = ref(storage, path);
    
    // Create upload task
    const uploadTask = uploadBytesResumable(storageRef, file);
    
    // Register progress observer if callback provided
    if (onProgress) {
      uploadTask.on('state_changed', onProgress);
    }
    
    // Wait for upload to complete
    await uploadTask;
    
    // Get download URL
    const downloadURL = await getDownloadURL(storageRef);
    return downloadURL;
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
};

// Upload multiple files at once
export const uploadMultipleFiles = async (
  basePath: string, 
  files: File[]
): Promise<string[]> => {
  try {
    const promises = files.map((file, index) => {
      const filePath = `${basePath}/${Date.now()}_${index}_${file.name}`;
      return uploadFile(filePath, file);
    });
    
    return await Promise.all(promises);
  } catch (error) {
    console.error('Error uploading multiple files:', error);
    throw error;
  }
};

// Delete a file from Firebase Storage
export const deleteFile = async (path: string): Promise<void> => {
  try {
    const fileRef = ref(storage, path);
    await deleteObject(fileRef);
  } catch (error) {
    console.error('Error deleting file:', error);
    throw error;
  }
};

// List all files in a directory
export const listFiles = async (path: string): Promise<string[]> => {
  try {
    const dirRef = ref(storage, path);
    const result = await listAll(dirRef);
    
    const urls = await Promise.all(
      result.items.map((itemRef) => getDownloadURL(itemRef))
    );
    
    return urls;
  } catch (error) {
    console.error('Error listing files:', error);
    throw error;
  }
};

// Get a file URL by path
export const getFileURL = async (path: string): Promise<string> => {
  try {
    const fileRef = ref(storage, path);
    return await getDownloadURL(fileRef);
  } catch (error) {
    console.error('Error getting file URL:', error);
    throw error;
  }
};