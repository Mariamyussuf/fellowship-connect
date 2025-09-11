import { openDB } from 'idb';
import type { DBSchema, IDBPDatabase } from 'idb';
import type { 
  FellowshipUser, 
  AttendanceRecord, 
  PrayerRequest, 
  WelfareRequest, 
  EvangelismReport, 
  Testimony 
} from '../types';

// Define the database schema
interface FellowshipDB extends DBSchema {
  users: {
    key: string;
    value: FellowshipUser;
    indexes: { 'by-role': string; 'by-status': string; };
  };
  attendance: {
    key: string;
    value: AttendanceRecord;
    indexes: { 'by-user': string; 'by-date': string; };
  };
  prayerRequests: {
    key: string;
    value: PrayerRequest;
    indexes: { 'by-user': string; 'by-status': string; };
  };
  welfareRequests: {
    key: string;
    value: WelfareRequest;
    indexes: { 'by-user': string; 'by-status': string; };
  };
  evangelismReports: {
    key: string;
    value: EvangelismReport;
    indexes: { 'by-user': string; 'by-status': string; };
  };
  testimonies: {
    key: string;
    value: Testimony;
    indexes: { 'by-status': string; 'by-category': string; };
  };
  syncQueue: {
    key: string;
    value: {
      id: string;
      collection: string;
      operation: 'create' | 'update' | 'delete';
      data: Record<string, unknown>;
      timestamp: number;
      retryCount: number;
    };
  };
  metadata: {
    key: string;
    value: {
      lastSync: number;
      version: number;
    };
  };
}

// Define specific store names to fix TypeScript error
type FellowshipDBStoreName = 'users' | 'attendance' | 'prayerRequests' | 'welfareRequests' | 'evangelismReports' | 'testimonies' | 'syncQueue' | 'metadata';

/**
 * Offline service for managing local data storage and background sync
 */
export class OfflineService {
  private static instance: OfflineService;
  private db: IDBPDatabase<FellowshipDB> | null = null;
  private syncInProgress = false;
  private syncInterval: NodeJS.Timeout | null = null;

  static getInstance(): OfflineService {
    if (!OfflineService.instance) {
      OfflineService.instance = new OfflineService();
    }
    return OfflineService.instance;
  }

  // Initialize the database
  async init(): Promise<void> {
    try {
      this.db = await openDB<FellowshipDB>('fellowship-connect', 1, {
        upgrade(db) {
          // Users store
          const usersStore = db.createObjectStore('users', { keyPath: 'id' });
          usersStore.createIndex('by-role', 'role');
          usersStore.createIndex('by-status', 'status');

          // Attendance store
          const attendanceStore = db.createObjectStore('attendance', { keyPath: 'id' });
          attendanceStore.createIndex('by-user', 'userId');
          attendanceStore.createIndex('by-date', 'timestamp');

          // Prayer requests store
          const prayerStore = db.createObjectStore('prayerRequests', { keyPath: 'id' });
          prayerStore.createIndex('by-user', 'userId');
          prayerStore.createIndex('by-status', 'status');

          // Welfare requests store
          const welfareStore = db.createObjectStore('welfareRequests', { keyPath: 'id' });
          welfareStore.createIndex('by-user', 'userId');
          welfareStore.createIndex('by-status', 'status');

          // Evangelism reports store
          const evangelismStore = db.createObjectStore('evangelismReports', { keyPath: 'id' });
          evangelismStore.createIndex('by-user', 'userId');
          evangelismStore.createIndex('by-status', 'status');

          // Testimonies store
          const testimoniesStore = db.createObjectStore('testimonies', { keyPath: 'id' });
          testimoniesStore.createIndex('by-status', 'status');
          testimoniesStore.createIndex('by-category', 'category');

          // Sync queue store
          db.createObjectStore('syncQueue', { keyPath: 'id' });

          // Metadata store
          db.createObjectStore('metadata', { keyPath: 'key' });
        },
      });

      // Start background sync
      this.startBackgroundSync();
      
      console.log('Offline service initialized successfully');
    } catch (error) {
      console.error('Failed to initialize offline service:', error);
      throw error;
    }
  }

  // Generic methods for storing data
  async storeData<T extends FellowshipDB[FellowshipDBStoreName]>(storeName: FellowshipDBStoreName, data: T['value'][]): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const tx = this.db.transaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);

    for (const item of data) {
      await store.put(item);
    }

    await tx.done;
  }

  async getData<T extends FellowshipDB[FellowshipDBStoreName]>(storeName: FellowshipDBStoreName): Promise<T['value'][]>;
  async getData<T extends FellowshipDB[FellowshipDBStoreName]>(storeName: FellowshipDBStoreName, key: string): Promise<T['value'][]>;
  async getData<T extends FellowshipDB[FellowshipDBStoreName]>(storeName: FellowshipDBStoreName, key?: string): Promise<T['value'][]> {
    if (!this.db) throw new Error('Database not initialized');

    const tx = this.db.transaction(storeName, 'readonly');
    const store = tx.objectStore(storeName);

    if (key) {
      const result = await store.get(key);
      return result ? [result] : [];
    }

    const results = await store.getAll();
    return results;
  }

  // Queue operations for sync when online
  async queueOperation(
    collection: string,
    operation: 'create' | 'update' | 'delete',
    data: Record<string, unknown>
  ): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const queueItem = {
      id: `${collection}_${operation}_${Date.now()}_${Math.random()}`,
      collection,
      operation,
      data,
      timestamp: Date.now(),
      retryCount: 0
    };

    const tx = this.db.transaction('syncQueue', 'readwrite');
    await tx.objectStore('syncQueue').add(queueItem);
    await tx.done;

    // Try to sync immediately if online
    if (navigator.onLine) {
      this.syncWithServer();
    }
  }

  // Background sync functionality
  private startBackgroundSync(): void {
    // Sync every 30 seconds when online
    this.syncInterval = setInterval(() => {
      if (navigator.onLine && !this.syncInProgress) {
        this.syncWithServer();
      }
    }, 30000);

    // Listen for online/offline events
    window.addEventListener('online', () => {
      console.log('Connection restored, starting sync...');
      this.syncWithServer();
    });

    window.addEventListener('offline', () => {
      console.log('Connection lost, switching to offline mode...');
    });
  }

  private async syncWithServer(): Promise<void> {
    if (this.syncInProgress || !this.db) return;

    this.syncInProgress = true;

    try {
      const tx = this.db.transaction('syncQueue', 'readwrite');
      const store = tx.objectStore('syncQueue');
      const queueItems = await store.getAll();

      for (const item of queueItems) {
        try {
          await this.processSyncItem(item);
          await store.delete(item.id);
        } catch (error) {
          console.error('Failed to sync item:', item, error);
          
          // Increment retry count
          item.retryCount++;
          
          // Remove items that have failed too many times
          if (item.retryCount > 5) {
            console.warn('Removing item after 5 failed attempts:', item);
            await store.delete(item.id);
          } else {
            await store.put(item);
          }
        }
      }

      await tx.done;

      // Update last sync timestamp
      await this.updateLastSync();

    } catch (error) {
      console.error('Sync process failed:', error);
    } finally {
      this.syncInProgress = false;
    }
  }

  private async processSyncItem(item: unknown): Promise<void> {
    // This would integrate with your Firebase services
    // For now, we'll simulate the sync process
    
    const { collection, operation, data } = item as { 
      collection: string; 
      operation: 'create' | 'update' | 'delete'; 
      data: unknown 
    };

    switch (collection) {
      case 'attendance':
        // Sync with attendance service
        console.log(`Syncing attendance ${operation}:`, data);
        break;
      case 'prayerRequests':
        // Sync with prayer request service
        console.log(`Syncing prayer request ${operation}:`, data);
        break;
      case 'welfareRequests':
        // Sync with welfare service
        console.log(`Syncing welfare request ${operation}:`, data);
        break;
      case 'evangelismReports':
        // Sync with evangelism service
        console.log(`Syncing evangelism report ${operation}:`, data);
        break;
      default:
        console.warn('Unknown collection for sync:', collection);
    }

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  private async updateLastSync(): Promise<void> {
    if (!this.db) return;

    const tx = this.db.transaction('metadata', 'readwrite');
    await tx.objectStore('metadata').put({
      lastSync: Date.now(),
      version: 1
    }, 'lastSync');
    await tx.done;
  }

  // Utility methods
  async isOnline(): Promise<boolean> {
    return navigator.onLine;
  }

  async getLastSyncTime(): Promise<number> {
    if (!this.db) return 0;

    const tx = this.db.transaction('metadata', 'readonly');
    const result = await tx.objectStore('metadata').get('lastSync');
    return result?.lastSync || 0;
  }

  async clearOfflineData(): Promise<void> {
    if (!this.db) return;

    const storeNames: FellowshipDBStoreName[] = [
      'users', 'attendance', 'prayerRequests', 
      'welfareRequests', 'evangelismReports', 'testimonies'
    ];

    for (const storeName of storeNames) {
      const tx = this.db.transaction(storeName, 'readwrite');
      await tx.objectStore(storeName).clear();
      await tx.done;
    }
  }

  async getStorageUsage(): Promise<{ used: number; quota: number }> {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      const estimate = await navigator.storage.estimate();
      return {
        used: estimate.usage || 0,
        quota: estimate.quota || 0
      };
    }
    return { used: 0, quota: 0 };
  }

  // Cleanup
  destroy(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }

    if (this.db) {
      this.db.close();
      this.db = null;
    }
  }
}

export const offlineService = OfflineService.getInstance();