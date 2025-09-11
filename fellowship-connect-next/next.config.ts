import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: true,
  // Enable PWA support
  experimental: {
    nextScriptWorkers: true,
  },
  // Allow images from Firebase Storage
  images: {
    domains: ['firebasestorage.googleapis.com'],
  },
  // Environment variables
  env: {
    FIREBASE_API_KEY: process.env.FIREBASE_API_KEY,
    FIREBASE_AUTH_DOMAIN: process.env.FIREBASE_AUTH_DOMAIN,
    FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID,
    FIREBASE_STORAGE_BUCKET: process.env.FIREBASE_STORAGE_BUCKET,
    FIREBASE_MESSAGING_SENDER_ID: process.env.FIREBASE_MESSAGING_SENDER_ID,
    FIREBASE_APP_ID: process.env.FIREBASE_APP_ID,
  },
  // Fix for Firebase + Turbopack issue
  webpack: (config) => {
    // Ignore warnings about __non_webpack_require__
    config.ignoreWarnings = [
      ...(config.ignoreWarnings || []),
      /__non_webpack_require__/
    ];
    
    return config;
  },
};

export default nextConfig;