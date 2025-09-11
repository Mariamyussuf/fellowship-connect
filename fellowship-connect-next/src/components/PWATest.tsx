'use client';

import { usePWA } from '../hooks/usePWA';
import { useEffect, useState } from 'react';

export default function PWATest() {
  const { 
    isInstallable, 
    isInstalled, 
    isOnline, 
    updateAvailable, 
    installApp, 
    updateApp 
  } = usePWA();
  
  const [swStatus, setSwStatus] = useState<string>('Checking...');
  
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistration().then(registration => {
        if (registration) {
          setSwStatus(`Registered: ${registration.scope}`);
        } else {
          setSwStatus('Not registered');
        }
      }).catch(error => {
        setSwStatus(`Error: ${error.message}`);
      });
    } else {
      setSwStatus('Not supported');
    }
  }, []);

  return (
    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg mt-4">
      <h3 className="text-lg font-semibold mb-2">PWA Status</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
        <div>Service Worker: {swStatus}</div>
        <div>Online: {isOnline ? 'Yes' : 'No'}</div>
        <div>Installable: {isInstallable ? 'Yes' : 'No'}</div>
        <div>Installed: {isInstalled ? 'Yes' : 'No'}</div>
        <div>Update Available: {updateAvailable ? 'Yes' : 'No'}</div>
      </div>
      
      {isInstallable && !isInstalled && (
        <button 
          onClick={() => installApp()}
          className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Install App
        </button>
      )}
      
      {updateAvailable && (
        <button 
          onClick={() => updateApp()}
          className="mt-2 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          Update App
        </button>
      )}
    </div>
  );
}