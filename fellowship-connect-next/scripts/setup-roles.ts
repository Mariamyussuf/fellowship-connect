/**
 * Role setup script
 * Creates default roles and permissions in the database
 * 
 * Note: This script requires Firebase Admin credentials to be set in environment variables.
 * For development, you can set them in a .env.local file.
 * For production, it's recommended to set them in Vercel environment variables.
 */

// Load environment variables from .env file if it exists
import * as dotenv from 'dotenv';
dotenv.config();

interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  createdAt: FirebaseFirestore.Timestamp; // Will be replaced with Timestamp
  updatedAt: FirebaseFirestore.Timestamp; // Will be replaced with Timestamp
}

async function setupRoles() {
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
      console.warn('Skipping role setup due to missing environment variables.');
      return;
    }
    
    // Dynamically import Firebase Admin SDK only when needed
    const { getFirebaseAdmin } = await import('../src/lib/firebase-admin');
    const { Timestamp } = await import('firebase-admin/firestore');
    
    const { db } = getFirebaseAdmin();
    
    console.log('Setting up default roles...');
    
    // Define default roles
    const roles: Role[] = [
      {
        id: 'member',
        name: 'Member',
        description: 'Regular fellowship member with basic access',
        permissions: [
          'read_own_profile',
          'update_own_profile',
          'create_prayer_request',
          'read_public_prayer_requests',
          'create_attendance',
          'read_own_attendance',
          'create_testimony',
          'read_approved_testimonies',
          'read_events',
          'read_announcements',
          'read_resources',
          'read_gallery'
        ],
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      },
      {
        id: 'admin',
        name: 'Admin',
        description: 'Fellowship administrator with management access',
        permissions: [
          'read_own_profile',
          'update_own_profile',
          'create_prayer_request',
          'read_all_prayer_requests',
          'update_prayer_requests',
          'delete_prayer_requests',
          'create_attendance',
          'read_all_attendance',
          'update_attendance',
          'delete_attendance',
          'create_testimony',
          'read_all_testimonies',
          'approve_testimonies',
          'delete_testimonies',
          'manage_events',
          'manage_announcements',
          'manage_resources',
          'manage_gallery',
          'manage_users',
          'read_reports',
          'export_data'
        ],
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      },
      {
        id: 'super-admin',
        name: 'Super Admin',
        description: 'System administrator with full access',
        permissions: [
          'read_own_profile',
          'update_own_profile',
          'create_prayer_request',
          'read_all_prayer_requests',
          'update_prayer_requests',
          'delete_prayer_requests',
          'create_attendance',
          'read_all_attendance',
          'update_attendance',
          'delete_attendance',
          'create_testimony',
          'read_all_testimonies',
          'approve_testimonies',
          'delete_testimonies',
          'manage_events',
          'manage_announcements',
          'manage_resources',
          'manage_gallery',
          'manage_users',
          'manage_roles',
          'manage_permissions',
          'read_reports',
          'export_data',
          'view_audit_logs',
          'system_configuration',
          'delete_users',
          'assign_roles'
        ],
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      },
      {
        id: 'chaplain',
        name: 'Chaplain',
        description: 'Fellowship chaplain with spiritual leadership access',
        permissions: [
          'read_own_profile',
          'update_own_profile',
          'create_prayer_request',
          'read_all_prayer_requests',
          'update_prayer_requests',
          'delete_prayer_requests',
          'create_attendance',
          'read_all_attendance',
          'read_reports',
          'create_testimony',
          'read_all_testimonies',
          'approve_testimonies',
          'manage_announcements',
          'manage_events',
          'manage_resources',
          'manage_gallery',
          'provide_pastoral_care',
          'view_welfare_requests',
          'respond_to_prayer_requests'
        ],
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      }
    ];
    
    // Create roles collection if it doesn't exist
    const rolesCollection = db.collection('roles');
    
    // Add or update each role
    for (const role of roles) {
      try {
        await rolesCollection.doc(role.id).set(role);
        console.log(`Role '${role.name}' created/updated successfully`);
      } catch (error) {
        console.error(`Failed to create/update role '${role.name}':`, error);
      }
    }
    
    console.log('Role setup completed successfully!');
  } catch (error) {
    console.error('Role setup failed:', error);
    process.exit(1);
  }
}

// Run the setup if this script is executed directly
if (require.main === module) {
  setupRoles().then(() => {
    console.log('Role setup script finished');
    process.exit(0);
  }).catch((error) => {
    console.error('Role setup script failed:', error);
    process.exit(1);
  });
}

export default setupRoles;