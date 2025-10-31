/**
 * Database initialization script
 * Sets up initial data structure and default values
 * 
 * Note: This script requires Firebase Admin credentials to be set in environment variables.
 * For development, you can set them in a .env.local file.
 * For production, it's recommended to set them in Vercel environment variables.
 */

// Load environment variables from .env file if it exists
import * as dotenv from 'dotenv';
dotenv.config();

async function initDatabase() {
  try {
    // Check if required environment variables are set
    const requiredEnvVars = [
      'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
      'FIREBASE_PRIVATE_KEY',
      'FIREBASE_CLIENT_EMAIL'
    ];
    
    const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);
    
    if (missingEnvVars.length > 0) {
      console.warn('⚠️  Missing required environment variables:');
      missingEnvVars.forEach(envVar => console.warn(`   - ${envVar}`));
      console.warn('\nPlease set these environment variables before running this script.');
      console.warn('You can either:');
      console.warn('1. Create a .env.local file with these variables');
      console.warn('2. Set them in your system environment');
      console.warn('3. Set them in your Vercel project settings (recommended)');
      console.warn('\nFor development, you can create a .env.local file with the following format:');
      console.warn('\nNEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id');
      console.warn('FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\\n...\\n-----END PRIVATE KEY-----\\n"');
      console.warn('FIREBASE_CLIENT_EMAIL=your-service-account@your-project.iam.gserviceaccount.com');
      console.warn('\nSkipping database initialization due to missing environment variables.');
      return;
    }
    
    // Dynamically import Firebase Admin SDK only when needed
    const { getFirebaseAdmin } = await import('../src/lib/firebase-admin');
    const _admin = await import('firebase-admin');
    const { Timestamp } = await import('firebase-admin/firestore');
    
    const { db } = getFirebaseAdmin();
    
    console.log('Firebase Admin SDK initialized successfully');
    
    // Create a simple test document to verify Firestore is working
    console.log('Creating test document...');
    await db.collection('test').doc('init-test').set({
      initialized: true,
      timestamp: Timestamp.now(),
      message: 'Database initialization test'
    });
    console.log('Test document created successfully!');
    
    console.log('Database initialization completed successfully!');
  } catch (error) {
    console.error('Database initialization failed:', error);
    process.exit(1);
  }
}

// Run the initialization if this script is executed directly
if (require.main === module) {
  initDatabase().then(() => {
    console.log('Database initialization script finished');
    process.exit(0);
  }).catch((error) => {
    console.error('Database initialization script failed:', error);
    process.exit(1);
  });
}

export default initDatabase;