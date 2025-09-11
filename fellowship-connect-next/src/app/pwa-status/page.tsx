'use client';

import { useEffect, useState } from 'react';

export default function PWAStatusPage() {
  const [status, setStatus] = useState({
    swRegistered: false,
    swStatus: 'Checking...',
    manifestLoaded: false,
    online: typeof navigator !== 'undefined' ? navigator.onLine : true,
  });

  useEffect(() => {
    // Check service worker status
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistration().then(registration => {
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
      }).catch(error => {
        setStatus(prev => ({
          ...prev,
          swRegistered: false,
          swStatus: `Error: ${error.message}`
        }));
      });
    } else {
      setStatus(prev => ({
        ...prev,
        swRegistered: false,
        swStatus: 'Not supported'
      }));
    }

    // Check if manifest is loaded
    const manifestLink = document.querySelector('link[rel="manifest"]');
    setStatus(prev => ({
      ...prev,
      manifestLoaded: !!manifestLink
    }));

    // Online status listener
    const handleOnline = () => {
      setStatus(prev => ({ ...prev, online: true }));
    };

    const handleOffline = () => {
      setStatus(prev => ({ ...prev, online: false }));
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">PWA Status</h1>
          <p className="text-gray-600">Check the status of your Progressive Web App</p>
        </div>

        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Service Worker Status</h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Registration Status:</span>
              <span className={`font-medium ${status.swRegistered ? 'text-green-600' : 'text-red-600'}`}>
                {status.swRegistered ? 'Registered' : 'Not Registered'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Details:</span>
              <span className="font-medium text-gray-800">{status.swStatus}</span>
            </div>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Manifest Status</h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Manifest Loaded:</span>
              <span className={`font-medium ${status.manifestLoaded ? 'text-green-600' : 'text-red-600'}`}>
                {status.manifestLoaded ? 'Yes' : 'No'}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Network Status</h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Online:</span>
              <span className={`font-medium ${status.online ? 'text-green-600' : 'text-red-600'}`}>
                {status.online ? 'Yes' : 'No'}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Testing Instructions</h2>
          <ul className="list-disc pl-5 space-y-2 text-gray-600">
            <li>Check that the service worker is registered in browser dev tools (Application → Service Workers)</li>
            <li>Test offline functionality by disconnecting from the network</li>
            <li>Try installing the app on your device (look for install prompt or menu option)</li>
            <li>Verify that the manifest is properly loaded (Application → Manifest)</li>
            <li>Test push notifications if implemented</li>
          </ul>
        </div>
      </div>
    </div>
  );
}