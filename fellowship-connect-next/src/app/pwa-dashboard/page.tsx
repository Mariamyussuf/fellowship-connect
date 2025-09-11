'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function PWADashboard() {
  const [status, setStatus] = useState({
    swRegistered: false,
    swStatus: 'Checking...',
    manifestLoaded: false,
    online: typeof navigator !== 'undefined' ? navigator.onLine : true,
    installable: false,
    installed: false
  });

  useEffect(() => {
    // Check service worker status
    const checkServiceWorker = async () => {
      if ('serviceWorker' in navigator) {
        try {
          const registration = await navigator.serviceWorker.getRegistration();
          if (registration) {
            setStatus(prev => ({
              ...prev,
              swRegistered: true,
              swStatus: `Registered at ${registration.scope}`
            }));
          } else {
            setStatus(prev => ({
              ...prev,
              swRegistered: false,
              swStatus: 'Not registered'
            }));
          }
        } catch (error) {
          // Type guard to ensure error is an Error instance
          const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
          setStatus(prev => ({
            ...prev,
            swRegistered: false,
            swStatus: `Error: ${errorMessage}`
          }));
        }
      } else {
        setStatus(prev => ({
          ...prev,
          swRegistered: false,
          swStatus: 'Not supported'
        }));
      }
    };

    // Check if manifest is loaded
    const checkManifest = () => {
      const manifestLink = document.querySelector('link[rel="manifest"]');
      setStatus(prev => ({
        ...prev,
        manifestLoaded: !!manifestLink
      }));
    };

    // Check install status
    const checkInstallStatus = () => {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
      const isInWebAppiOS = (window.navigator as { standalone?: boolean }).standalone === true;
      const isInstalled = isStandalone || isInWebAppiOS;
      
      setStatus(prev => ({
        ...prev,
        installed: isInstalled
      }));
    };

    // Online status listener
    const handleOnline = () => {
      setStatus(prev => ({ ...prev, online: true }));
    };

    const handleOffline = () => {
      setStatus(prev => ({ ...prev, online: false }));
    };

    // Run initial checks
    checkServiceWorker();
    checkManifest();
    checkInstallStatus();

    // Set up listeners
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Clean up listeners
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">PWA Dashboard</h1>
          <p className="text-gray-600">Monitor and test your Progressive Web App functionality</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Service Worker</h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Status:</span>
                <span className={`font-medium ${status.swRegistered ? 'text-green-600' : 'text-red-600'}`}>
                  {status.swRegistered ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div className="text-sm text-gray-500">
                {status.swStatus}
              </div>
            </div>
          </div>

          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">App Status</h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Manifest:</span>
                <span className={`font-medium ${status.manifestLoaded ? 'text-green-600' : 'text-red-600'}`}>
                  {status.manifestLoaded ? 'Loaded' : 'Missing'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Network:</span>
                <span className={`font-medium ${status.online ? 'text-green-600' : 'text-red-600'}`}>
                  {status.online ? 'Online' : 'Offline'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Installation:</span>
                <span className={`font-medium ${status.installed ? 'text-green-600' : 'text-yellow-600'}`}>
                  {status.installed ? 'Installed' : 'Not Installed'}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">PWA Testing Tools</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Link 
              href="/pwa-test" 
              className="block p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <h3 className="font-medium text-gray-900 mb-1">Comprehensive PWA Test</h3>
              <p className="text-sm text-gray-500">Run full suite of PWA functionality tests</p>
            </Link>
            
            <Link 
              href="/pwa-status" 
              className="block p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <h3 className="font-medium text-gray-900 mb-1">Status Monitor</h3>
              <p className="text-sm text-gray-500">Real-time monitoring of PWA components</p>
            </Link>
            
            <Link 
              href="/offline-test" 
              className="block p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <h3 className="font-medium text-gray-900 mb-1">Offline Testing</h3>
              <p className="text-sm text-gray-500">Test offline functionality and caching</p>
            </Link>
            
            <Link 
              href="/notification-test" 
              className="block p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <h3 className="font-medium text-gray-900 mb-1">Notification Test</h3>
              <p className="text-sm text-gray-500">Test push notifications functionality</p>
            </Link>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Next Steps</h2>
          <div className="prose max-w-none">
            <ul>
              <li>Test the app on different devices and browsers</li>
              <li>Verify installation on mobile devices</li>
              <li>Test offline functionality by disconnecting from the network</li>
              <li>Validate push notifications work correctly</li>
              <li>Check Lighthouse scores for PWA compliance</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}