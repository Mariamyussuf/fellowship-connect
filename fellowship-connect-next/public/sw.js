// Cache name constant - kept for potential future use
// const CACHE_NAME = 'fellowship-connect-v1';
const STATIC_CACHE = 'fellowship-static-v1';
const DYNAMIC_CACHE = 'fellowship-dynamic-v1';

// Assets to cache immediately
const STATIC_ASSETS = [
  '/manifest.json',
  '/offline.html'
];

// API endpoints to cache
const API_CACHE_PATTERNS = [
  /\/api\/testimonies/,
  /\/api\/prayers/,
  /\/api\/attendance/,
  /\/api\/welfare/,
  /\/api\/evangelism/,
  /\/api\/pwa-status/,
  /\/api\/pwa-test/,
  /\/api\/offline-test/,
  /\/api\/cache-test/,
  /\/api\/manifest-test/,
  /\/api\/pwa-complete-test/,
  /\/api\/send-notification/
];

// Install event - cache static assets
self.addEventListener('install', event => {
  console.log('Service Worker installing...');
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => {
        console.log('Caching static assets');
        // Cache each asset individually to handle errors gracefully
        const cachePromises = STATIC_ASSETS.map(asset => {
          return fetch(asset)
            .then(response => {
              if (response.ok) {
                return cache.put(asset, response);
              } else {
                throw new Error(`Failed to fetch ${asset}: ${response.status}`);
              }
            })
            .catch(error => {
              console.error(`Failed to cache ${asset}:`, error);
              // Continue with other assets even if one fails
              return Promise.resolve();
            });
        });
        return Promise.all(cachePromises);
      })
      .then(() => {
        console.log('Static assets cached');
        return self.skipWaiting();
      })
      .catch(error => {
        console.error('Failed to cache static assets:', error);
        // Continue installation even if caching fails
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
      }
    )
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
        request.destination === 'manifest' ||
        url.pathname === '/') {
      event.respondWith(cacheFirstStrategy(request));
    }
    // API calls - Network First with cache fallback
    else if (API_CACHE_PATTERNS.some(pattern => pattern.test(url.pathname))) {
      event.respondWith(networkFirstStrategy(request));
    }
    // Images, fonts, styles, scripts - Cache First
    else if (request.destination === 'image' || 
             request.destination === 'font' ||
             request.destination === 'style' ||
             request.destination === 'script') {
      event.respondWith(cacheFirstStrategy(request));
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
    // For static assets, try to serve from cache even if it's stale
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    // For navigation requests, serve offline page
    if (request.destination === 'document') {
      return caches.match('/offline.html');
    }
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
  } catch (_error) {
    console.log('POST request failed, queuing for background sync');
    console.error('POST request error:', _error);
    
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
    if ('serviceWorker' in navigator && 'sync' in self.registration) {
      await self.registration.sync.register('background-sync');
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
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
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
      const deleteRequest = store.delete(timestamp);
      
      deleteRequest.onsuccess = () => resolve();
      deleteRequest.onerror = () => reject(deleteRequest.error);
    };
  });
}

// Push notification event
self.addEventListener('push', event => {
  console.log('Push event received:', event);
  
  if (event.data) {
    const data = event.data.json();
    console.log('Push data:', data);
    
    const title = data.title || 'Fellowship Connect';
    const options = {
      body: data.body || 'You have a new notification',
      icon: '/icons/icon-192x192.svg',
      badge: '/icons/icon-192x192.svg',
      vibrate: [100, 50, 100],
      data: {
        dateOfArrival: Date.now(),
        primaryKey: data.primaryKey || 1,
        url: data.url || '/'
      },
      actions: [
        {
          action: 'view',
          title: 'View',
          icon: '/icons/icon-192x192.svg'
        },
        {
          action: 'close',
          title: 'Close'
        }
      ]
    };

    event.waitUntil(
      self.registration.showNotification(title, options)
    );
  }
});

// Notification click event
self.addEventListener('notificationclick', event => {
  console.log('Notification clicked:', event);
  event.notification.close();

  if (event.action === 'view') {
    event.waitUntil(
      clients.openWindow(event.notification.data?.url || '/prayers')
    );
  } else {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Message event for communication with main thread
self.addEventListener('message', event => {
  // Only log specific message types to reduce console spam
  if (event.data && (event.data.type === 'TEST_MESSAGE' || event.data.type === 'INTEGRATION_TEST')) {
    console.log('Message received in service worker:', event.data.type);
  }
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  } else if (event.data && event.data.type === 'TEST_MESSAGE') {
    console.log('Test message received in service worker');
    // Send a response back to the client
    event.source.postMessage({
      type: 'TEST_RESPONSE',
      message: 'Hello from service worker!',
      timestamp: Date.now()
    });
  } else if (event.data && event.data.type === 'INTEGRATION_TEST') {
    console.log('Integration test message received in service worker');
    // Send a response back to the client
    event.source.postMessage({
      type: 'INTEGRATION_RESPONSE',
      message: 'Integration test successful!',
      timestamp: Date.now()
    });
  }
});
