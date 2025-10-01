/**
 * Comprehensive database setup script
 * Runs all initialization and setup scripts in the correct order
 * 
 * Note: This script requires Firebase Admin credentials to be set in environment variables.
 * For development, you can set them in a .env.local file.
 * For production, it's recommended to set them in Vercel environment variables.
 */

// Load environment variables from .env file if it exists
import * as dotenv from 'dotenv';
dotenv.config();

async function setupDatabase() {
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
      console.warn('\nSkipping database setup due to missing environment variables.');
      return;
    }
    
    console.log('Starting comprehensive database setup...');
    
    // Dynamically import the setup scripts
    const initDatabase = (await import('./init-database')).default;
    const setupRoles = (await import('./setup-roles')).default;
    const setupConfig = (await import('./setup-config')).default;
    
    // Step 1: Initialize database structure
    console.log('\n--- Step 1: Initializing Database Structure ---');
    await initDatabase();
    
    // Step 2: Set up roles and permissions
    console.log('\n--- Step 2: Setting Up Roles and Permissions ---');
    await setupRoles();
    
    // Step 3: Set up configuration
    console.log('\n--- Step 3: Setting Up Application Configuration ---');
    await setupConfig();
    
    console.log('\n✅ Database setup completed successfully!');
    console.log('\nNext steps:');
    console.log('1. Verify the database structure in Firebase Console');
    console.log('2. Test API endpoints to ensure they work correctly');
    console.log('3. Create your first admin user through the signup endpoint');
    console.log('4. Assign admin role to your user through Firebase Console');
    
  } catch (error) {
    console.error('Database setup failed:', error);
    process.exit(1);
  }
}

// Run the setup if this script is executed directly
if (require.main === module) {
  setupDatabase().then(() => {
    console.log('\n🎉 All setup scripts completed successfully!');
    process.exit(0);
  }).catch((error) => {
    console.error('\n❌ Setup process failed:', error);
    process.exit(1);
  });
}

export default setupDatabase;