/**
 * Firebase Admin SDK initialization
 * Provides a singleton instance of Firebase Admin SDK for server-side operations
 * 
 * This module dynamically imports Firebase Admin SDK only when needed,
 * which prevents initialization errors when environment variables are not set.
 * 
 * Usage:
 * ```ts
 * const { getFirebaseAdmin } = require('@/lib/firebase-admin');
 * const { app, db, auth, storage } = getFirebaseAdmin();
 * ```
 */

// Global variables to store Firebase Admin instances
let firebaseApp;
let firestoreDb;
let authInstance;
let storageInstance;

/**
 * Gets Firebase Admin SDK instances
 * Initializes Firebase Admin SDK if not already initialized
 * 
 * @returns Object containing Firebase Admin instances
 * @throws Error if Firebase Admin credentials are not set
 */
function getFirebaseAdmin() {
  // Check if required environment variables are set
  const requiredEnvVars = [
    'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
    'FIREBASE_PRIVATE_KEY',
    'FIREBASE_CLIENT_EMAIL'
  ];
  
  const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);
  
  if (missingEnvVars.length > 0) {
    throw new Error(`Missing required environment variables: ${missingEnvVars.join(', ')}`);
  }
  
  // Return existing instances if already initialized
  if (firebaseApp && firestoreDb && authInstance && storageInstance) {
    return {
      app: firebaseApp,
      db: firestoreDb,
      auth: authInstance,
      storage: storageInstance
    };
  }
  
  // Import Firebase Admin SDK dynamically
  const admin = require('firebase-admin');
  
  // Initialize Firebase Admin SDK if not already initialized
  if (admin.apps.length === 0) {
    firebaseApp = admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL
      })
    });
  } else {
    firebaseApp = admin.app();
  }
  
  // Initialize Firestore, Auth, and Storage instances
  firestoreDb = admin.firestore();
  authInstance = admin.auth();
  storageInstance = admin.storage();
  
  return {
    app: firebaseApp,
    db: firestoreDb,
    auth: authInstance,
    storage: storageInstance
  };
}

module.exports = { getFirebaseAdmin };