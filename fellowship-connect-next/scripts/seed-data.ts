/**
 * Data seeding script
 * Populates the database with sample data for development and testing
 * 
 * Note: This script requires Firebase Admin credentials to be set in environment variables.
 * For development, you can set them in a .env.local file.
 * For production, it's recommended to set them in Vercel environment variables.
 */

// Load environment variables from .env file if it exists
import * as dotenv from 'dotenv';
dotenv.config();

async function seedData() {
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
      console.warn('Skipping data seeding due to missing environment variables.');
      return;
    }
    
    // Dynamically import Firebase Admin SDK only when needed
    const { getFirebaseAdmin } = await import('../src/lib/firebase-admin');
    const { Timestamp: _Timestamp } = await import('firebase-admin/firestore');
    
    const { db } = getFirebaseAdmin();
    
    console.log('Seeding database with sample data...');
    
    // Create sample users
    console.log('\n--- Creating Sample Users ---');
    const usersCollection = db.collection('users');
    
    const sampleUsers = [
      {
        uid: 'user-admin-001',
        email: 'admin@fellowship.example.com',
        displayName: 'Admin User',
        role: 'admin',
        photoURL: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString()
      },
      {
        uid: 'user-chaplain-001',
        email: 'chaplain@fellowship.example.com',
        displayName: 'Chaplain User',
        role: 'chaplain',
        photoURL: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString()
      },
      {
        uid: 'user-member-001',
        email: 'member1@fellowship.example.com',
        displayName: 'Member One',
        role: 'member',
        photoURL: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString()
      },
      {
        uid: 'user-member-002',
        email: 'member2@fellowship.example.com',
        displayName: 'Member Two',
        role: 'member',
        photoURL: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString()
      }
    ];
    
    for (const user of sampleUsers) {
      try {
        await usersCollection.doc(user.uid).set(user);
        console.log(`Created user: ${user.displayName} (${user.email})`);
      } catch (error) {
        console.error(`Failed to create user ${user.displayName}:`, error);
      }
    }
    
    // Create sample prayer requests
    console.log('\n--- Creating Sample Prayer Requests ---');
    const prayerRequestsCollection = db.collection('prayerRequests');
    
    const samplePrayerRequests = [
      {
        userId: 'user-member-001',
        title: 'Healing for Family Member',
        description: 'My grandmother is in the hospital and needs healing',
        isAnonymous: false,
        status: 'approved',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        userId: 'user-member-002',
        title: 'Job Interview Success',
        description: 'I have an important job interview next week and need wisdom',
        isAnonymous: true,
        status: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        userId: 'user-chaplain-001',
        title: 'Campus Revival',
        description: 'Praying for spiritual awakening on our campus',
        isAnonymous: false,
        status: 'approved',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];
    
    for (const request of samplePrayerRequests) {
      try {
        const _docRef = await prayerRequestsCollection.add(request);
        console.log(`Created prayer request: ${request.title}`);
      } catch (error) {
        console.error(`Failed to create prayer request ${request.title}:`, error);
      }
    }
    
    // Create sample events
    console.log('\n--- Creating Sample Events ---');
    const eventsCollection = db.collection('events');
    
    const sampleEvents = [
      {
        title: 'Weekly Bible Study',
        description: 'Join us for our weekly Bible study session',
        date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // Next week
        location: 'Fellowship Hall',
        startTime: '19:00',
        endTime: '20:30',
        isRecurring: true,
        recurrencePattern: 'weekly',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        title: 'Campus Outreach',
        description: 'Evangelism event on campus',
        date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // In two weeks
        location: 'Campus Quad',
        startTime: '10:00',
        endTime: '14:00',
        isRecurring: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];
    
    for (const event of sampleEvents) {
      try {
        const _docRef = await eventsCollection.add(event);
        console.log(`Created event: ${event.title}`);
      } catch (error) {
        console.error(`Failed to create event ${event.title}:`, error);
      }
    }
    
    // Create sample announcements
    console.log('\n--- Creating Sample Announcements ---');
    const announcementsCollection = db.collection('announcements');
    
    const sampleAnnouncements = [
      {
        title: 'New Ministry Launch',
        content: 'We are excited to announce the launch of our new discipleship ministry',
        author: 'user-admin-001',
        priority: 'normal',
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        title: 'Service Schedule Update',
        content: 'Please note the updated service schedule for the summer months',
        author: 'user-chaplain-001',
        priority: 'high',
        expiresAt: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(), // 15 days from now
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];
    
    for (const announcement of sampleAnnouncements) {
      try {
        const _docRef = await announcementsCollection.add(announcement);
        console.log(`Created announcement: ${announcement.title}`);
      } catch (error) {
        console.error(`Failed to create announcement ${announcement.title}:`, error);
      }
    }
    
    console.log('\n✅ Data seeding completed successfully!');
    console.log('\nSample data includes:');
    console.log('- 4 sample users (admin, chaplain, 2 members)');
    console.log('- 3 sample prayer requests');
    console.log('- 2 sample events');
    console.log('- 2 sample announcements');
    
  } catch (error) {
    console.error('Data seeding failed:', error);
    process.exit(1);
  }
}

// Run the seeding if this script is executed directly
if (require.main === module) {
  seedData().then(() => {
    console.log('\n🌱 Data seeding script finished');
    process.exit(0);
  }).catch((error) => {
    console.error('\n❌ Data seeding script failed:', error);
    process.exit(1);
  });
}

export default seedData;