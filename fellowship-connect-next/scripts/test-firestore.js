/**
 * Simple Firestore test script
 * Tests basic Firestore connectivity
 */

// Load environment variables from .env file if it exists
import * as dotenv from 'dotenv';
dotenv.config();

async function testFirestore() {
  try {
    console.log('Testing Firestore connectivity...');
    
    // Dynamically import Firebase Admin SDK only when needed
    const { getFirebaseAdmin } = await import('../src/lib/firebase-admin');
    const { db } = getFirebaseAdmin();
    
    console.log('Firebase Admin SDK initialized successfully');
    
    // Try to list collections (this should work even if there are no collections)
    console.log('Listing collections...');
    const collections = await db.listCollections();
    console.log(`Found ${collections.length} collections`);
    
    // Try to create a simple document
    console.log('Creating test document...');
    const docRef = db.collection('test').doc('connectivity-test');
    await docRef.set({
      test: true,
      timestamp: new Date().toISOString()
    });
    console.log('Test document created successfully!');
    
    console.log('Firestore connectivity test completed successfully!');
  } catch (error) {
    console.error('Firestore connectivity test failed:', error);
    process.exit(1);
  }
}

// Run the test if this script is executed directly
if (require.main === module) {
  testFirestore().then(() => {
    console.log('Firestore test script finished');
    process.exit(0);
  }).catch((error) => {
    console.error('Firestore test script failed:', error);
    process.exit(1);
  });
}

export default testFirestore;