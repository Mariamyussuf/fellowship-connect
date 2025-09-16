'use client';

import { useState, useEffect } from 'react';
import { initFirebase } from '../../lib/firebase';

export default function FirebaseTestPage() {
  const [firebaseStatus, setFirebaseStatus] = useState('Not initialized');
  const [authStatus, setAuthStatus] = useState('Not checked');
  const [error, setError] = useState('');

  const testFirebaseInit = async () => {
    try {
      setFirebaseStatus('Initializing...');
      const result = await initFirebase();
      setFirebaseStatus(result ? 'Initialized successfully' : 'Initialization failed');
      
      // Check if auth is available
      const { auth } = await import('../../lib/firebase');
      setAuthStatus(auth ? 'Auth available' : 'Auth not available');
    } catch (err) {
      console.error('Firebase test error:', err);
      setError('Firebase test failed: ' + (err as Error).message);
      setFirebaseStatus('Initialization failed');
    }
  };

  useEffect(() => {
    // Test Firebase initialization
    testFirebaseInit();
  }, []);

  return (
    <div className="min-h-screen p-8">
      <h1 className="text-2xl font-bold mb-4">Firebase Test</h1>
      
      <div className="mb-4">
        <h2 className="text-xl font-semibold">Status</h2>
        <p>Firebase: {firebaseStatus}</p>
        <p>Auth: {authStatus}</p>
        {error && <p className="text-red-500">Error: {error}</p>}
      </div>
      
      <button 
        onClick={testFirebaseInit}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Test Firebase Initialization
      </button>
      
      <div className="mt-8">
        <h2 className="text-xl font-semibold">Instructions</h2>
        <p>Check the browser console for detailed logs.</p>
      </div>
    </div>
  );
}