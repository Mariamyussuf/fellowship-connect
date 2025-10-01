/**
 * Firebase Admin SDK test script
 * Verifies that Firebase Admin SDK can be initialized with the provided credentials
 */

// Load environment variables from .env file if it exists
import * as dotenv from 'dotenv';
dotenv.config();

async function testFirebase() {
  try {
    console.log('Testing Firebase Admin SDK initialization...');
    
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
      return;
    }
    
    console.log('Environment variables found:');
    console.log(`  NEXT_PUBLIC_FIREBASE_PROJECT_ID: ${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ? '[SET]' : '[MISSING]'}`);
    console.log(`  FIREBASE_CLIENT_EMAIL: ${process.env.FIREBASE_CLIENT_EMAIL ? '[SET]' : '[MISSING]'}`);
    console.log(`  FIREBASE_PRIVATE_KEY: ${process.env.FIREBASE_PRIVATE_KEY ? '[SET]' : '[MISSING]'}`);
    
    // Try to initialize Firebase Admin SDK
    console.log('\nInitializing Firebase Admin SDK...');
    const { getFirebaseAdmin } = await import('../src/lib/firebase-admin');
    
    const { app, db } = getFirebaseAdmin();
    
    console.log('✅ Firebase Admin SDK initialized successfully!');
    // Use the project ID from environment variables since app.options.projectId might be undefined
    console.log(`   Project ID: ${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'Not found'}`);
    
    // Try a simple database operation
    console.log('\nTesting database connection...');
    const testCollection = db.collection('test');
    const testDoc = await testCollection.limit(1).get();
    console.log('✅ Database connection successful!');
    
  } catch (error) {
    console.error('❌ Firebase Admin SDK initialization failed:', error);
    console.error('\nTroubleshooting tips:');
    console.error('1. Check that your Firebase Admin credentials are correct');
    console.error('2. Ensure the service account has the necessary permissions');
    console.error('3. Verify that the Firebase project exists and is accessible');
  }
}

// Run the test if this script is executed directly
if (require.main === module) {
  testFirebase().then(() => {
    console.log('\n🎉 Firebase test script finished');
    process.exit(0);
  }).catch((error) => {
    console.error('\n❌ Firebase test script failed:', error);
    process.exit(1);
  });
}

export default testFirebase;