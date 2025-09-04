const CACHE_NAME = 'fellowship-connect-v1';
const STATIC_CACHE = 'fellowship-static-v1';
const DYNAMIC_CACHE = 'fellowship-dynamic-v1';

// Assets to cache immediately
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  // Add other critical assets
];

// API endpoints to cache
const API_CACHE_PATTERNS = [
  /\/api\/testimonies/,
  /\/api\/prayers/,
  /\/api\/attendance/,
  /\/api\/welfare/,
  /\/api\/evangelism/
];

// Install event - cache static assets
self.addEventListener('install', event => {
  console.log('Service Worker installing...');
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => {
        console.log('Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('Static assets cached');
        return self.skipWaiting();
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  console.log('Service Worker activating...');
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
              console.log('Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('Service Worker activated');
        return self.clients.claim();
      })
  );
});

// Fetch event - implement caching strategies
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip chrome-extension and other unsupported schemes
  if (!url.protocol.startsWith('http')) {
    return;
  }

  // Handle different types of requests
  if (request.method === 'GET') {
    // Static assets - Cache First
    if (STATIC_ASSETS.includes(url.pathname) || 
        request.destination === 'image' || 
        request.destination === 'font' ||
        request.destination === 'style' ||
        request.destination === 'script') {
      event.respondWith(cacheFirstStrategy(request));
    }
    // API calls - Network First with cache fallback
    else if (API_CACHE_PATTERNS.some(pattern => pattern.test(url.pathname))) {
      event.respondWith(networkFirstStrategy(request));
    }
    // HTML pages - Network First with cache fallback
    else if (request.destination === 'document') {
      event.respondWith(networkFirstStrategy(request));
    }
    // Other requests - Network First
    else {
      event.respondWith(networkFirstStrategy(request));
    }
  }
  // POST requests - Network only with background sync
  else if (request.method === 'POST') {
    event.respondWith(handlePostRequest(request));
  }
});

// Cache First Strategy - for static assets
async function cacheFirstStrategy(request) {
  try {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(STATIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.error('Cache first strategy failed:', error);
    return new Response('Offline - Content not available', { status: 503 });
  }
}

// Network First Strategy - for dynamic content
async function networkFirstStrategy(request) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.log('Network failed, trying cache:', error);
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return offline page for navigation requests
    if (request.destination === 'document') {
      return caches.match('/offline.html') || 
             new Response('Offline', { status: 503 });
    }
    
    return new Response('Offline - Content not available', { status: 503 });
  }
}

// Handle POST requests with background sync
async function handlePostRequest(request) {
  try {
    return await fetch(request);
  } catch (error) {
    console.log('POST request failed, queuing for background sync');
    
    // Store the request for background sync
    const requestData = {
      url: request.url,
      method: request.method,
      headers: Object.fromEntries(request.headers.entries()),
      body: await request.text(),
      timestamp: Date.now()
    };
    
    // Store in IndexedDB for background sync
    await storeFailedRequest(requestData);
    
    // Register background sync
    if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
      const registration = await navigator.serviceWorker.ready;
      await registration.sync.register('background-sync');
    }
    
    return new Response(JSON.stringify({ 
      success: false, 
      message: 'Request queued for sync when online' 
    }), {
      status: 202,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// Background sync event
self.addEventListener('sync', event => {
  if (event.tag === 'background-sync') {
    console.log('Background sync triggered');
    event.waitUntil(syncFailedRequests());
  }
});

// Sync failed requests when back online
async function syncFailedRequests() {
  try {
    const failedRequests = await getFailedRequests();
    
    for (const requestData of failedRequests) {
      try {
        const response = await fetch(requestData.url, {
          method: requestData.method,
          headers: requestData.headers,
          body: requestData.body
        });
        
        if (response.ok) {
          await removeFailedRequest(requestData.timestamp);
          console.log('Successfully synced request:', requestData.url);
        }
      } catch (error) {
        console.error('Failed to sync request:', error);
      }
    }
  } catch (error) {
    console.error('Background sync failed:', error);
  }
}

// IndexedDB operations for failed requests
async function storeFailedRequest(requestData) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('fellowship-sync', 1);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction(['failed-requests'], 'readwrite');
      const store = transaction.objectStore('failed-requests');
      store.add(requestData);
      transaction.oncomplete = () => resolve();
    };
    
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains('failed-requests')) {
        const store = db.createObjectStore('failed-requests', { keyPath: 'timestamp' });
        store.createIndex('url', 'url', { unique: false });
      }
    };
  });
}

async function getFailedRequests() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('fellowship-sync', 1);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction(['failed-requests'], 'readonly');
      const store = transaction.objectStore('failed-requests');
      const getAllRequest = store.getAll();
      
      getAllRequest.onsuccess = () => resolve(getAllRequest.result);
      getAllRequest.onerror = () => reject(getAllRequest.error);
    };
  });
}

async function removeFailedRequest(timestamp) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('fellowship-sync', 1);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction(['failed-requests'], 'readwrite');
      const store = transaction.objectStore('failed-requests');
      store.delete(timestamp);
      transaction.oncomplete = () => resolve();
    };
  });
}

// Push notification event
self.addEventListener('push', event => {
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body,
      icon: '/icons/icon-192x192.png',
      badge: '/icons/badge-72x72.png',
      vibrate: [100, 50, 100],
      data: {
        dateOfArrival: Date.now(),
        primaryKey: data.primaryKey || 1
      },
      actions: [
        {
          action: 'view',
          title: 'View',
          icon: '/icons/view-action.png'
        },
        {
          action: 'close',
          title: 'Close',
          icon: '/icons/close-action.png'
        }
      ]
    };

    event.waitUntil(
      self.registration.showNotification(data.title, options)
    );
  }
});

// Notification click event
self.addEventListener('notificationclick', event => {
  event.notification.close();

  if (event.action === 'view') {
    event.waitUntil(
      clients.openWindow('/prayers') // or appropriate URL based on notification type
    );
  }
});

// Message event for communication with main thread
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
