import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  type User
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db, initFirebase } from '../lib/firebase';
import type { FellowshipUser } from '../types';

// Ensure Firebase is initialized before using auth functions
const ensureFirebaseInitialized = async () => {
  if (!auth) {
    console.log('Firebase not initialized, initializing now...');
    await initFirebase();
  }
  
  if (!auth) {
    throw new Error('Firebase authentication is not available');
  }
};

// Register a new user
export const registerUser = async (email: string, password: string, userData: Partial<FellowshipUser>): Promise<User> => {
  try {
    // Ensure Firebase is initialized
    await ensureFirebaseInitialized();
    
    // Create user with email and password
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Set additional user profile data
    if (userData.displayName) {
      await updateProfile(user, {
        displayName: userData.displayName,
        photoURL: userData.photoURL || null
      });
    }

    // Store user data in Firestore
    await setDoc(doc(db, 'users', user.uid), {
      uid: user.uid,
      email: user.email,
      displayName: userData.displayName || null,
      role: userData.role || 'member',
      fullName: userData.fullName || '',
      age: userData.age || null,
      birthday: userData.birthday || '',
      department: userData.department || '',
      phoneNumber: userData.phoneNumber || '',
      academicYear: userData.academicYear || '',
      photoURL: userData.photoURL || null,
      createdAt: new Date().toISOString()
    });

    return user;
  } catch (error) {
    console.error('Error registering user:', error);
    throw error;
  }
};

// Sign in existing user
export const signIn = async (email: string, password: string) => {
  try {
    // Ensure Firebase is initialized
    await ensureFirebaseInitialized();
    
    return await signInWithEmailAndPassword(auth, email, password);
  } catch (error) {
    console.error('Error signing in:', error);
    throw error;
  }
};

// Sign out user
export const logOut = async () => {
  try {
    // Ensure Firebase is initialized
    await ensureFirebaseInitialized();
    
    await signOut(auth);
  } catch (error) {
    console.error('Error signing out:', error);
    throw error;
  }
};

// Send password reset email
export const resetPassword = async (email: string) => {
  try {
    // Ensure Firebase is initialized
    await ensureFirebaseInitialized();
    
    await sendPasswordResetEmail(auth, email);
  } catch (error) {
    console.error('Error sending password reset email:', error);
    throw error;
  }
};

// Get current authenticated user
export const getCurrentUser = async (): Promise<User | null> => {
  // Ensure Firebase is initialized
  await ensureFirebaseInitialized();
  
  return auth.currentUser;
};