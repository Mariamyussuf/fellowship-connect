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
    NEXT_PUBLIC_FIREBASE_API_KEY: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    NEXT_PUBLIC_FIREBASE_PROJECT_ID: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    NEXT_PUBLIC_FIREBASE_APP_ID: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
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