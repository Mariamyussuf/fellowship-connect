// Re-export all Firebase services
export { default as app, auth, db, storage } from './config';

// Auth services
export * from './auth';

// Firestore services
export * from './firestore';

// Storage services
export * from './storage';