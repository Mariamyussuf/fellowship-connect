'use client';

import { createContext, useState, useEffect, useContext, type ReactNode } from 'react';
import { type User, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';

interface FellowshipUser {
  id?: string;
  uid: string;
  displayName?: string;
  email?: string;
  phoneNumber?: string;
  fullName?: string;
  role: 'member' | 'admin' | 'super-admin';
  status?: 'active' | 'inactive' | 'suspended';
  campus?: string;
  profileComplete?: boolean;
  createdAt?: string;
  updatedAt?: string;
  lastLoginAt?: string;
  academicYear?: string;
  major?: string;
  yearOfStudy?: '100 Level' | '200 Level' | '300 Level' | '400 Level' | '500 Level' | 'Masters' | 'PhD';
  expectedGraduation?: string;
  photoURL?: string | null;
  active?: boolean;
  age?: number;
  birthday?: string;
  department?: string;
}

interface AuthContextType {
  currentUser: User | null;
  userProfile: FellowshipUser | null;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const defaultContextValue: AuthContextType = {
  currentUser: null,
  userProfile: null,
  isAdmin: false,
  isSuperAdmin: false,
  loading: true,
  login: async () => {},
  signup: async () => {},
  logout: async () => {},
};

const AuthContext = createContext<AuthContextType>(defaultContextValue);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<FellowshipUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if Firebase auth is properly initialized
    if (!auth) {
      console.error('Firebase auth is not initialized');
      setLoading(false);
      return;
    }

    console.log('Initializing auth state listener');
    
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log('Auth state changed:', user);
      setCurrentUser(user);
      
      if (user) {
        // Set a simple session cookie for middleware compatibility
        // In production, you'd use Firebase's session management
        document.cookie = "session=true; path=/";
        
        // Check if Firestore is properly initialized
        if (!db) {
          console.error('Firebase Firestore is not initialized');
          setLoading(false);
          return;
        }
        
        // Fetch additional user profile data from Firestore
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            setUserProfile(userDoc.data() as FellowshipUser);
          } else {
            // Create a basic profile if user exists but profile doesn't
            const newUserProfile: FellowshipUser = {
              uid: user.uid,
              displayName: user.displayName || undefined,
              email: user.email || undefined,
              role: 'member',
              photoURL: user.photoURL,
              active: true,
            };
            setUserProfile(newUserProfile);
            await setDoc(doc(db, 'users', user.uid), newUserProfile);
          }
        } catch (error) {
          console.error('Error fetching user profile:', error);
        }
      } else {
        setUserProfile(null);
        // Remove session cookie on logout
        document.cookie = "session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const login = async (email: string, password: string) => {
    console.log('Attempting to login with email:', email);
    
    // Check if Firebase auth is properly initialized
    if (!auth) {
      throw new Error('Firebase auth is not initialized');
    }
    
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log('Login successful:', userCredential);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const signup = async (email: string, password: string) => {
    console.log('Attempting to signup with email:', email);
    
    // Check if Firebase auth is properly initialized
    if (!auth) {
      throw new Error('Firebase auth is not initialized');
    }
    
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Check if Firestore is properly initialized
      if (!db) {
        throw new Error('Firebase Firestore is not initialized');
      }
      
      // Create a basic profile for the new user
      const newUserProfile: FellowshipUser = {
        uid: user.uid,
        email: user.email || undefined,
        role: 'member',
        active: true,
      };
      
      await setDoc(doc(db, 'users', user.uid), newUserProfile);
      console.log('Signup successful:', userCredential);
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    }
  };

  const logout = async () => {
    // Check if Firebase auth is properly initialized
    if (!auth) {
      console.warn('Firebase auth is not initialized, cannot logout');
      return;
    }
    
    try {
      await signOut(auth);
      // Remove session cookie if it exists
      document.cookie = "session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      console.log('Logout successful');
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  };

  // Check if user is admin
  const isAdmin = userProfile?.role === 'admin' || userProfile?.role === 'super-admin';
  
  // Check if user is superadmin
  const isSuperAdmin = userProfile?.role === 'super-admin';

  const value = {
    currentUser,
    userProfile,
    isAdmin,
    isSuperAdmin,
    loading,
    login,
    signup,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (!context) {
    console.warn('useAuth must be used within an AuthProvider');
    return defaultContextValue;
  }
  
  return context;
};