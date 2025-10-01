// Firebase Admin SDK initialization with edge runtime compatibility
// This module handles initialization differently based on the runtime environment

// Export uninitialized references
export let app: any = null;
export let auth: any = null;
export let db: any = null;
export let storage: any = null;

// Flag to track initialization status
let isInitialized = false;
let isInitializing = false;

/**
 * Initialize Firebase Admin SDK safely
 * This function handles different runtime environments and avoids edge runtime issues
 */
export async function initializeFirebaseAdmin() {
  // Prevent multiple simultaneous initializations
  if (isInitializing) {
    // Wait for initialization to complete
    while (isInitializing && !isInitialized) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    return isInitialized;
  }

  // Return if already initialized
  if (isInitialized) {
    return true;
  }

  // Set initializing flag
  isInitializing = true;

  try {
    // Check if we're in a server environment (not edge runtime)
    // and if we have the required environment variables
    const isServerEnvironment = typeof process !== 'undefined' && 
                                process.env && 
                                process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID &&
                                process.env.FIREBASE_PRIVATE_KEY &&
                                process.env.FIREBASE_CLIENT_EMAIL;

    if (!isServerEnvironment) {
      console.log('Skipping Firebase Admin initialization - not in server environment or missing env vars');
      isInitializing = false;
      return false;
    }

    // Dynamic imports to avoid issues with static imports in edge runtime
    const { initializeApp, getApps, cert } = await import('firebase-admin/app');
    const { getAuth } = await import('firebase-admin/auth');
    const { getFirestore } = await import('firebase-admin/firestore');
    const { getStorage } = await import('firebase-admin/storage');

    // Check if already initialized
    if (getApps().length > 0) {
      app = getApps()[0];
    } else {
      // Configuration for Firebase Admin
      const isVercel = process.env.VERCEL === '1';
      const adminConfig = {
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        privateKey: isVercel 
          ? process.env.FIREBASE_PRIVATE_KEY 
          : process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      };

      // Validate configuration
      if (!adminConfig.projectId || !adminConfig.privateKey || !adminConfig.clientEmail) {
        console.warn('Firebase Admin configuration is incomplete');
        isInitializing = false;
        return false;
      }

      // Initialize Firebase Admin app
      app = initializeApp({
        credential: cert(adminConfig as any),
        storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      });
    }

    // Initialize services
    auth = getAuth(app);
    db = getFirestore(app);
    storage = getStorage(app);

    // Set initialized flag
    isInitialized = true;
    isInitializing = false;

    console.log('Firebase Admin SDK initialized successfully');
    return true;
  } catch (error) {
    console.error('Failed to initialize Firebase Admin SDK:', error);
    isInitializing = false;
    return false;
  }
}

/**
 * Get Firebase Admin services safely
 * Initializes if not already initialized
 */
export async function getFirebaseAdmin() {
  if (!isInitialized) {
    const success = await initializeFirebaseAdmin();
    if (!success) {
      throw new Error('Firebase Admin SDK failed to initialize');
    }
  }
  
  return { app, auth, db, storage };
}

// Try to initialize Firebase Admin SDK on module load (in server environments)
if (typeof process !== 'undefined' && process.env) {
  // Use setTimeout to avoid blocking module loading
  setTimeout(() => {
    initializeFirebaseAdmin().catch(error => {
      console.error('Error during Firebase Admin initialization:', error);
    });
  }, 0);
}