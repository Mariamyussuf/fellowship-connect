// Re-export all Firebase services
export { app, auth, db, storage } from '../lib/firebase';

// Auth services
export * from './auth';

// Firestore services
export * from './firestore';

// Storage services
export * from './storage';