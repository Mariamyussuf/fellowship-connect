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
    const { Timestamp } = await import('firebase-admin/firestore');
    
    const { db } = getFirebaseAdmin();
    
    // Create default roles if they don't exist
    console.log('Setting up default roles...');
    
    // Create initial collections by adding a placeholder document
    // This ensures the collections exist in Firestore
    
    // Users collection placeholder
    const usersCollection = db.collection('users');
    await usersCollection.doc('_init').set({
      initialized: true,
      timestamp: Timestamp.now()
    });
    console.log('Users collection initialized');
    
    // Attendance collection placeholder
    const attendanceCollection = db.collection('attendance');
    await attendanceCollection.doc('_init').set({
      initialized: true,
      timestamp: Timestamp.now()
    });
    console.log('Attendance collection initialized');
    
    // QR Code Sessions collection placeholder
    const qrCodeSessionsCollection = db.collection('qrCodeSessions');
    await qrCodeSessionsCollection.doc('_init').set({
      initialized: true,
      timestamp: Timestamp.now()
    });
    console.log('QR Code Sessions collection initialized');
    
    // Prayer Requests collection placeholder
    const prayerRequestsCollection = db.collection('prayerRequests');
    await prayerRequestsCollection.doc('_init').set({
      initialized: true,
      timestamp: Timestamp.now()
    });
    console.log('Prayer Requests collection initialized');
    
    // Welfare Support collection placeholder
    const welfareSupportCollection = db.collection('welfareSupport');
    await welfareSupportCollection.doc('_init').set({
      initialized: true,
      timestamp: Timestamp.now()
    });
    console.log('Welfare Support collection initialized');
    
    // Evangelism Reports collection placeholder
    const evangelismReportsCollection = db.collection('evangelismReports');
    await evangelismReportsCollection.doc('_init').set({
      initialized: true,
      timestamp: Timestamp.now()
    });
    console.log('Evangelism Reports collection initialized');
    
    // Media collection placeholder
    const mediaCollection = db.collection('media');
    await mediaCollection.doc('_init').set({
      initialized: true,
      timestamp: Timestamp.now()
    });
    console.log('Media collection initialized');
    
    // Notifications collection placeholder
    const notificationsCollection = db.collection('notifications');
    await notificationsCollection.doc('_init').set({
      initialized: true,
      timestamp: Timestamp.now()
    });
    console.log('Notifications collection initialized');
    
    // Audit Logs collection placeholder
    const auditLogsCollection = db.collection('auditLogs');
    await auditLogsCollection.doc('_init').set({
      initialized: true,
      timestamp: Timestamp.now()
    });
    console.log('Audit Logs collection initialized');
    
    // Offline Attendance collection placeholder
    const offlineAttendanceCollection = db.collection('offlineAttendance');
    await offlineAttendanceCollection.doc('_init').set({
      initialized: true,
      timestamp: Timestamp.now()
    });
    console.log('Offline Attendance collection initialized');
    
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