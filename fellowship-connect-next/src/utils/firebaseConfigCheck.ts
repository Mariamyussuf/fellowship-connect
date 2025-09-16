/**
 * Firebase Configuration Check Utility
 * 
 * This utility helps verify that all required Firebase environment variables
 * are properly configured before initializing the Firebase app.
 * 
 * The error "Cannot find name 'process'" was occurring because TypeScript 
 * didn't recognize Node.js globals. This has been fixed by adding "node" 
 * to the "types" array in tsconfig.json.
 */

/**
 * Check if Firebase configuration is complete
 * @returns {boolean} True if all required config values are present
 */
export const isFirebaseConfigComplete = (): boolean => {
  // Check if we're in a browser environment
  if (typeof window === 'undefined') {
    // Server-side: Check process.env
    return !!(
      process.env.NEXT_PUBLIC_FIREBASE_API_KEY &&
      process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN &&
      process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID &&
      process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET &&
      process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID &&
      process.env.NEXT_PUBLIC_FIREBASE_APP_ID
    );
  } else {
    // Client-side: Configuration should be provided via public runtime config
    // This is just for demonstration - in a real app, you'd check differently
    console.warn('Firebase config check on client-side is limited for security reasons');
    return true;
  }
};

/**
 * Get missing Firebase configuration keys
 * @returns {string[]} Array of missing configuration key names
 */
export const getMissingFirebaseConfigKeys = (): string[] => {
  const requiredKeys = [
    'NEXT_PUBLIC_FIREBASE_API_KEY',
    'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
    'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
    'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
    'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
    'NEXT_PUBLIC_FIREBASE_APP_ID'
  ];

  if (typeof window === 'undefined') {
    // Server-side check
    return requiredKeys.filter(key => !process.env[key]);
  } else {
    // Client-side: We can't check env vars directly for security
    console.warn('Cannot check env vars on client-side for security reasons');
    return [];
  }
};

export default {
  isFirebaseConfigComplete,
  getMissingFirebaseConfigKeys
};