import { initializeApp, getApps, cert, type ServiceAccount } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';

/**
 * Firebase Admin SDK initialization module with singleton pattern
 * Provides type-safe configuration and proper error handling
 */

// Type-safe configuration interface
interface FirebaseAdminConfig {
  projectId: string;
  privateKey: string;
  clientEmail: string;
}

// Singleton instances
let adminApp: ReturnType<typeof initializeApp> | null = null;
let adminAuth: ReturnType<typeof getAuth> | null = null;
let adminDb: ReturnType<typeof getFirestore> | null = null;
let adminStorage: ReturnType<typeof getStorage> | null = null;

/**
 * Get Firebase Admin configuration from environment variables
 * @returns FirebaseAdminConfig with service account details
 */
function getFirebaseAdminConfig(): FirebaseAdminConfig {
  // Check if we're in a Vercel environment
  const isVercel = process.env.VERCEL === '1';

  // Handle private key formatting for different environments
  let privateKey = process.env.FIREBASE_PRIVATE_KEY || '';
  
  // In non-Vercel environments, we may need to replace escaped newlines
  if (!isVercel) {
    privateKey = privateKey.replace(/\\n/g, '\n');
  }

  const config: FirebaseAdminConfig = {
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || '',
    privateKey,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL || ''
  };

  // Validate required configuration
  const missingKeys: string[] = [];
  if (!config.projectId) missingKeys.push('NEXT_PUBLIC_FIREBASE_PROJECT_ID');
  if (!config.privateKey) missingKeys.push('FIREBASE_PRIVATE_KEY');
  if (!config.clientEmail) missingKeys.push('FIREBASE_CLIENT_EMAIL');

  if (missingKeys.length > 0) {
    throw new Error(`Missing Firebase Admin configuration keys: ${missingKeys.join(', ')}`);
  }

  return config;
}

/**
 * Initialize Firebase Admin SDK with singleton pattern
 * Prevents multiple initializations and handles environment differences
 * @returns Object containing initialized Firebase Admin services
 */
export function initializeFirebaseAdmin() {
  // Return existing instances if already initialized
  if (adminApp && adminAuth && adminDb && adminStorage) {
    return {
      app: adminApp,
      auth: adminAuth,
      db: adminDb,
      storage: adminStorage
    };
  }

  try {
    // Get configuration
    const config = getFirebaseAdminConfig();

    // Create service account object
    const serviceAccount: ServiceAccount = {
      projectId: config.projectId,
      privateKey: config.privateKey,
      clientEmail: config.clientEmail
    };

    // Initialize app only if not already initialized
    if (getApps().length === 0) {
      adminApp = initializeApp({
        credential: cert(serviceAccount),
        storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
      });
    } else {
      adminApp = getApps()[0];
    }

    // Initialize services
    adminAuth = getAuth(adminApp);
    adminDb = getFirestore(adminApp);
    adminStorage = getStorage(adminApp);

    console.log('Firebase Admin SDK initialized successfully');

    return {
      app: adminApp,
      auth: adminAuth,
      db: adminDb,
      storage: adminStorage
    };
  } catch (error) {
    console.error('Failed to initialize Firebase Admin SDK:', error);
    throw new Error(`Firebase Admin SDK initialization failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Get initialized Firebase Admin services
 * Initializes if not already initialized
 * @returns Object containing Firebase Admin services
 */
export function getFirebaseAdmin() {
  // Initialize if not already done
  if (!adminApp || !adminAuth || !adminDb || !adminStorage) {
    return initializeFirebaseAdmin();
  }

  return {
    app: adminApp,
    auth: adminAuth,
    db: adminDb,
    storage: adminStorage
  };
}

// Export individual services for convenience
export const { app, auth, db, storage } = getFirebaseAdmin();

export type { FirebaseAdminConfig };