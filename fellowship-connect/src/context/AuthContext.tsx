import React, { createContext, useState, useEffect, useContext } from 'react';
import { type User, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase/config';
import type { FellowshipUser } from '../types';

interface AuthContextType {
  currentUser: User | null;
  userProfile: FellowshipUser | null;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  userProfile: null,
  isAdmin: false,
  isSuperAdmin: false,
  loading: true,
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<FellowshipUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      
      if (user) {
        // Fetch additional user profile data from Firestore
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            setUserProfile(userDoc.data() as FellowshipUser);
          } else {
            // Create a basic profile if user exists but profile doesn't
            setUserProfile({
              uid: user.uid,
              displayName: user.displayName || undefined,
              email: user.email || undefined,
              role: 'member',
              photoURL: user.photoURL,
              active: true,
            });
          }
        } catch (error) {
          console.error('Error fetching user profile:', error);
        }
      } else {
        setUserProfile(null);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

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
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use the auth context
export const useAuth = () => {
  return useContext(AuthContext);
};