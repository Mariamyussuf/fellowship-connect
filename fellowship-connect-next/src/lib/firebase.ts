// Firebase configuration with conditional initialization for SSR compatibility
import type { FirebaseOptions } from 'firebase/app';

// Log environment variables for debugging (without exposing sensitive values)
console.log('Firebase config loading...');
console.log('API Key exists:', !!process.env.FIREBASE_API_KEY);
console.log('Auth Domain exists:', !!process.env.FIREBASE_AUTH_DOMAIN);
console.log('Project ID exists:', !!process.env.FIREBASE_PROJECT_ID);

// Firebase configuration with type checking
const firebaseConfig: FirebaseOptions = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID
};

// Check if required config values are present
const requiredConfigKeys: (keyof FirebaseOptions)[] = [
  'apiKey',
  'authDomain',
  'projectId',
  'storageBucket',
  'messagingSenderId',
  'appId'
];

const missingKeys: string[] = [];
requiredConfigKeys.forEach(key => {
  if (!firebaseConfig[key]) {
    missingKeys.push(key);
  }
});

if (missingKeys.length > 0) {
  console.error('Missing Firebase configuration keys:', missingKeys);
  console.error('Current config:', {
    apiKey: firebaseConfig.apiKey ? '[REDACTED]' : undefined,
    authDomain: firebaseConfig.authDomain,
    projectId: firebaseConfig.projectId,
    storageBucket: firebaseConfig.storageBucket,
    messagingSenderId: firebaseConfig.messagingSenderId,
    appId: firebaseConfig.appId
  });
  // Instead of throwing an error, we'll initialize with a minimal config for development
  // In production, you should handle this more gracefully
  console.warn('Firebase configuration is incomplete. Some features may not work.');
}

console.log('Firebase config prepared:', {
  apiKey: firebaseConfig.apiKey ? '[REDACTED]' : undefined,
  authDomain: firebaseConfig.authDomain,
  projectId: firebaseConfig.projectId,
  storageBucket: firebaseConfig.storageBucket,
  messagingSenderId: firebaseConfig.messagingSenderId,
  appId: firebaseConfig.appId ? '[REDACTED]' : undefined
});

// Export uninitialized references with explicit any types to maintain compatibility
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export let auth: any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export let db: any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export let storage: any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export let analytics: any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export let app: any;

// Conditional initialization function to avoid SSR issues
export const initFirebase = async () => {
  if (typeof window !== 'undefined') {
    try {
      // Dynamically import Firebase modules only on client side
      const { initializeApp, getApps } = await import('firebase/app');
      const { getAuth } = await import('firebase/auth');
      const { getFirestore } = await import('firebase/firestore');
      const { getStorage } = await import('firebase/storage');
      
      // Prevent multiple initializations
      app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
      
      // Initialize services only if app is initialized
      if (app) {
        auth = getAuth(app);
        db = getFirestore(app);
        storage = getStorage(app);
        
        console.log('Firebase app initialized:', app.name);
        
        // Initialize Analytics only on client-side
        try {
          const { getAnalytics } = await import('firebase/analytics');
          analytics = getAnalytics(app);
          console.log('Firebase Analytics initialized');
        } catch (error) {
          console.warn('Firebase Analytics failed to initialize:', error);
        }
      }
    } catch (error) {
      console.error('Firebase initialization error:', error);
    }
  } else {
    console.log('Firebase initialization skipped on server side');
  }
};

// Initialize Firebase immediately if we're on the client
if (typeof window !== 'undefined') {
  initFirebase();
}