/**
 * Configuration setup script
 * Creates default application configuration settings
 * 
 * Note: This script requires Firebase Admin credentials to be set in environment variables.
 * For development, you can set them in a .env.local file.
 * For production, it's recommended to set them in Vercel environment variables.
 */

// Load environment variables from .env file if it exists
import * as dotenv from 'dotenv';
dotenv.config();

interface AppConfig {
  id: string;
  appName: string;
  version: string;
  description: string;
  contactEmail: string;
  supportEmail: string;
  adminEmail: string;
  fellowshipName: string;
  fellowshipLocation: string;
  timeZone: string;
  createdAt: FirebaseFirestore.Timestamp; // Will be replaced with Timestamp
  updatedAt: FirebaseFirestore.Timestamp; // Will be replaced with Timestamp
}

interface FeatureConfig {
  id: string;
  attendanceSystem: boolean;
  prayerRequestSystem: boolean;
  welfareSupportSystem: boolean;
  evangelismTracking: boolean;
  mediaGallery: boolean;
  notifications: boolean;
  offlineMode: boolean;
  createdAt: FirebaseFirestore.Timestamp; // Will be replaced with Timestamp
  updatedAt: FirebaseFirestore.Timestamp; // Will be replaced with Timestamp
}

interface SecurityConfig {
  id: string;
  sessionTimeout: number; // in minutes
  maxLoginAttempts: number;
  passwordMinLength: number;
  requireEmailVerification: boolean;
  twoFactorAuth: boolean;
  createdAt: FirebaseFirestore.Timestamp; // Will be replaced with Timestamp
  updatedAt: FirebaseFirestore.Timestamp; // Will be replaced with Timestamp
}

async function setupConfig() {
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
      console.warn('Skipping config setup due to missing environment variables.');
      return;
    }
    
    // Dynamically import Firebase Admin SDK only when needed
    const { getFirebaseAdmin } = await import('../src/lib/firebase-admin');
    const { Timestamp } = await import('firebase-admin/firestore');
    
    const { db } = getFirebaseAdmin();
    
    console.log('Setting up application configuration...');
    
    // Application configuration
    const appConfig: AppConfig = {
      id: 'app-config',
      appName: 'Fellowship Connect',
      version: '1.0.0',
      description: 'A comprehensive fellowship management platform',
      contactEmail: 'contact@fellowship.example.com',
      supportEmail: 'support@fellowship.example.com',
      adminEmail: 'admin@fellowship.example.com',
      fellowshipName: 'Campus Fellowship',
      fellowshipLocation: 'University Campus',
      timeZone: 'America/New_York',
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    };
    
    // Feature configuration
    const featureConfig: FeatureConfig = {
      id: 'feature-config',
      attendanceSystem: true,
      prayerRequestSystem: true,
      welfareSupportSystem: true,
      evangelismTracking: true,
      mediaGallery: true,
      notifications: true,
      offlineMode: true,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    };
    
    // Security configuration
    const securityConfig: SecurityConfig = {
      id: 'security-config',
      sessionTimeout: 60, // 1 hour
      maxLoginAttempts: 5,
      passwordMinLength: 8,
      requireEmailVerification: true,
      twoFactorAuth: false,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    };
    
    // Save configurations to Firestore
    const configCollection = db.collection('config');
    
    try {
      await configCollection.doc('app').set(appConfig);
      console.log('Application configuration saved');
    } catch (error) {
      console.error('Failed to save application configuration:', error);
    }
    
    try {
      await configCollection.doc('features').set(featureConfig);
      console.log('Feature configuration saved');
    } catch (error) {
      console.error('Failed to save feature configuration:', error);
    }
    
    try {
      await configCollection.doc('security').set(securityConfig);
      console.log('Security configuration saved');
    } catch (error) {
      console.error('Failed to save security configuration:', error);
    }
    
    console.log('Configuration setup completed successfully!');
  } catch (error) {
    console.error('Configuration setup failed:', error);
    process.exit(1);
  }
}

// Run the setup if this script is executed directly
if (require.main === module) {
  setupConfig().then(() => {
    console.log('Configuration setup script finished');
    process.exit(0);
  }).catch((error) => {
    console.error('Configuration setup script failed:', error);
    process.exit(1);
  });
}

export default setupConfig;