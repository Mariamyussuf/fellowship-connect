import { useState, useEffect } from 'react';
import { offlineService } from '../services/offlineService';

export const useOffline = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [lastSyncTime, setLastSyncTime] = useState<number>(0);
  const [storageUsage, setStorageUsage] = useState({ used: 0, quota: 0 });

  useEffect(() => {
    // Initialize offline service
    offlineService.init().catch(console.error);

    // Update online status
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Load initial data
    loadOfflineData();

    // Update storage usage periodically
    const storageInterval = setInterval(updateStorageUsage, 60000); // Every minute

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(storageInterval);
    };
  }, []);

  const loadOfflineData = async () => {
    try {
      const lastSync = await offlineService.getLastSyncTime();
      setLastSyncTime(lastSync);
      await updateStorageUsage();
    } catch (error) {
      console.error('Failed to load offline data:', error);
    }
  };

  const updateStorageUsage = async () => {
    try {
      const usage = await offlineService.getStorageUsage();
      setStorageUsage(usage);
    } catch (error) {
      console.error('Failed to get storage usage:', error);
    }
  };

  const clearOfflineData = async () => {
    try {
      await offlineService.clearOfflineData();
      await updateStorageUsage();
      setLastSyncTime(0);
    } catch (error) {
      console.error('Failed to clear offline data:', error);
      throw error;
    }
  };

  const formatStorageSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getStoragePercentage = (): number => {
    if (storageUsage.quota === 0) return 0;
    return (storageUsage.used / storageUsage.quota) * 100;
  };

  return {
    isOnline,
    lastSyncTime,
    storageUsage: {
      ...storageUsage,
      usedFormatted: formatStorageSize(storageUsage.used),
      quotaFormatted: formatStorageSize(storageUsage.quota),
      percentage: getStoragePercentage()
    },
    clearOfflineData,
    updateStorageUsage
  };
};
