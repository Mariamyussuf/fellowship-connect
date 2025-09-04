// This file contains example Firebase security rules for your project.
// To use these rules, you would copy them to your Firebase console or deploy them using the Firebase CLI.

// Firestore Rules
/*
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Helper function to check if user is authenticated
    function isAuthenticated() {
      return request.auth != null;
    }
    
    // Helper function to check if user is an admin
    function isAdmin() {
      return isAuthenticated() && 
             get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // Helper function to check if user is a superadmin
    function isSuperAdmin() {
      return isAuthenticated() && 
             get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'superadmin';
    }
    
    // Helper function to check if user is accessing their own data
    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }
    
    // Users collection rules
    match /users/{userId} {
      // Users can read their own profile; admins can read all profiles
      allow read: if isOwner(userId) || isAdmin() || isSuperAdmin();
      // Users can create their own profile; only admins can create profiles for others
      allow create: if isOwner(userId) || isAdmin() || isSuperAdmin();
      // Users can update their own profile; only admins can update profiles for others
      allow update: if isOwner(userId) || isAdmin() || isSuperAdmin();
      // Only superadmins can delete user profiles
      allow delete: if isSuperAdmin();
    }
    
    // Members collection rules
    match /members/{memberId} {
      allow read: if isAuthenticated();
      allow write: if isAdmin() || isSuperAdmin();
    }
    
    // Attendance collection rules
    match /attendance/{recordId} {
      allow read: if isAuthenticated();
      allow write: if isAuthenticated();
    }
    
    // Events collection rules
    match /events/{eventId} {
      allow read: if isAuthenticated();
      allow write: if isAdmin() || isSuperAdmin();
    }
    
    // Gallery collection rules
    match /gallery/{photoId} {
      allow read: if isAuthenticated();
      allow write: if isAdmin() || isSuperAdmin();
    }
    
    // Prayer requests collection rules
    match /prayerRequests/{requestId} {
      // Anyone can create prayer requests
      allow create: if isAuthenticated();
      // Only the owner, admins, or superadmins can update/delete
      allow update, delete: if isOwner(resource.data.userId) || isAdmin() || isSuperAdmin();
      // Privacy settings check for reading
      allow read: if isAuthenticated() && 
                   (resource.data.isPublic == true || 
                    isOwner(resource.data.userId) || 
                    isAdmin() || 
                    isSuperAdmin());
    }
    
    // Testimonies collection rules
    match /testimonies/{testimonyId} {
      // Anyone can create testimonies
      allow create: if isAuthenticated();
      // Only the owner, admins, or superadmins can update/delete
      allow update, delete: if isOwner(resource.data.userId) || isAdmin() || isSuperAdmin();
      // Only approved testimonies are publicly readable
      allow read: if isAuthenticated() && 
                   (resource.data.approved == true || 
                    isOwner(resource.data.userId) || 
                    isAdmin() || 
                    isSuperAdmin());
    }
    
    // Announcements collection rules
    match /announcements/{announcementId} {
      allow read: if isAuthenticated();
      allow write: if isAdmin() || isSuperAdmin();
    }
    
    // Resources collection rules
    match /resources/{resourceId} {
      allow read: if isAuthenticated();
      allow write: if isAdmin() || isSuperAdmin();
    }
    
    // Service opportunities collection rules
    match /serviceOpportunities/{opportunityId} {
      allow read: if isAuthenticated();
      allow write: if isAdmin() || isSuperAdmin();
    }
  }
}
*/

// Storage Rules
/*
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Helper function to check if user is authenticated
    function isAuthenticated() {
      return request.auth != null;
    }
    
    // Helper function to check if user is an admin
    function isAdmin() {
      return isAuthenticated() && 
             firestore.get(/databases/(default)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // Helper function to check if user is a superadmin
    function isSuperAdmin() {
      return isAuthenticated() && 
             firestore.get(/databases/(default)/documents/users/$(request.auth.uid)).data.role == 'superadmin';
    }
    
    // Profile photos
    match /profilePhotos/{userId}/{fileName} {
      // Users can upload their own profile photo
      allow read: if isAuthenticated();
      allow write: if isAuthenticated() && request.auth.uid == userId;
    }
    
    // Gallery photos
    match /gallery/{year}/{eventType}/{fileName} {
      allow read: if isAuthenticated();
      allow write: if isAdmin() || isSuperAdmin();
    }
    
    // Event attachments
    match /events/{eventId}/{fileName} {
      allow read: if isAuthenticated();
      allow write: if isAdmin() || isSuperAdmin();
    }
    
    // Resource files
    match /resources/{category}/{fileName} {
      allow read: if isAuthenticated();
      allow write: if isAdmin() || isSuperAdmin();
    }
    
    // Prevent files larger than 5MB
    match /{allPaths=**} {
      allow write: if request.resource.size <= 5 * 1024 * 1024;
    }
  }
}
*/