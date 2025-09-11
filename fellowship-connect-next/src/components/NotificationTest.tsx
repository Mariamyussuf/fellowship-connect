'use client';

import { usePWA } from '../hooks/usePWA';
import { useState } from 'react';

export default function NotificationTest() {
  const { requestNotificationPermission, subscribeToPushNotifications } = usePWA();
  const [permissionStatus, setPermissionStatus] = useState<NotificationPermission | 'default'>('default');
  const [subscriptionStatus, setSubscriptionStatus] = useState<string>('Not subscribed');

  const requestPermission = async () => {
    const granted = await requestNotificationPermission();
    setPermissionStatus(granted ? 'granted' : 'denied');
  };

  const subscribe = async () => {
    setSubscriptionStatus('Subscribing...');
    try {
      const subscription = await subscribeToPushNotifications();
      if (subscription) {
        setSubscriptionStatus('Subscribed successfully');
        console.log('Push subscription:', subscription);
      } else {
        setSubscriptionStatus('Subscription failed');
      }
    } catch (error) {
      // Type guard to ensure error is an Error instance
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      setSubscriptionStatus(`Error: ${errorMessage}`);
    }
  };

  return (
    <div className="bg-white shadow rounded-lg p-6 mt-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Push Notifications Test</h2>
      
      <div className="space-y-4">
        <div>
          <h3 className="font-medium text-gray-700 mb-2">Notification Permission</h3>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">
              Status: <span className="font-medium">
                {permissionStatus === 'default' ? 'Not requested' : permissionStatus}
              </span>
            </span>
            <button
              onClick={requestPermission}
              className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
            >
              Request Permission
            </button>
          </div>
        </div>

        <div>
          <h3 className="font-medium text-gray-700 mb-2">Push Subscription</h3>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">
              Status: <span className="font-medium">{subscriptionStatus}</span>
            </span>
            <button
              onClick={subscribe}
              disabled={permissionStatus !== 'granted'}
              className={`px-3 py-1 text-white text-sm rounded ${
                permissionStatus === 'granted' 
                  ? 'bg-green-600 hover:bg-green-700' 
                  : 'bg-gray-400 cursor-not-allowed'
              }`}
            >
              Subscribe
            </button>
          </div>
        </div>
      </div>

      {permissionStatus === 'denied' && (
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
          <p className="text-sm text-yellow-700">
            Notifications are blocked. Please enable them in your browser settings to receive push notifications.
          </p>
        </div>
      )}
    </div>
  );
}