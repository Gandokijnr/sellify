// This is a custom service worker that extends the default PWA plugin functionality

// Cache names
const CACHE_NAME = 'selify-cache-v1';
const OFFLINE_URL = '/offline.html';

// Assets to precache
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/offline.html',
  '/https://res.cloudinary.com/dqqycsgmn/image/upload/b_rgb:FFFFFF/e_improve,e_sharpen/v1747912623/selify_fav_icon_kejjeh.png',
  '/https://res.cloudinary.com/dqqycsgmn/image/upload/b_rgb:FFFFFF/e_improve,e_sharpen/v1747912623/selify_fav_icon_kejjeh.png',
  '/https://res.cloudinary.com/dqqycsgmn/image/upload/b_rgb:FFFFFF/e_improve,e_sharpen/v1747912623/selify_fav_icon_kejjeh.png'
];

// Install event - precache key assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(ASSETS_TO_CACHE);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event - serve from cache or network with improved offline support
self.addEventListener('fetch', (event) => {
  // Handle message API requests differently
  if (event.request.url.includes('/api/messages')) {
    event.respondWith(handleMessageRequest(event));
    return;
  }

  // For other requests, use standard cache-first strategy
  event.respondWith(
    caches.match(event.request)
      .then(async (response) => {
        // Cache hit - return cached response
        if (response) {
          // Try to fetch a fresh copy in the background
          fetch(event.request)
            .then(async (networkResponse) => {
              if (networkResponse.ok) {
                const cache = await caches.open(CACHE_NAME);
                await cache.put(event.request, networkResponse);
              }
            })
            .catch(() => { /* Ignore errors, we'll keep using cached version */ });
          
          return response;
        }
        
        // Not in cache - try network
        try {
          const networkResponse = await fetch(event.request);
          if (networkResponse.ok) {
            // Cache successful responses
            const cache = await caches.open(CACHE_NAME);
            await cache.put(event.request, networkResponse.clone());
          }
          return networkResponse;
        } catch (error) {
          // Network error
          if (event.request.mode === 'navigate') {
            return caches.match(OFFLINE_URL);
          }
          throw error;
        }
      })
  );
});

// Handle message-related requests
async function handleMessageRequest(event) {
  // For message sending
  if (event.request.method === 'POST') {
    try {
      // Try to send message normally
      const response = await fetch(event.request);
      if (response.ok) {
        return response;
      }
      throw new Error('Network response was not ok');
    } catch (error) {
      // If offline, store in IndexedDB
      const message = await event.request.json();
      const db = await openDB('selify-offline-db', 1);
      await db.add('offline-messages', {
        ...message,
        timestamp: new Date().toISOString(),
        status: 'pending'
      });
      
      // Register for background sync
      await self.registration.sync.register('sync-messages');
      
      // Return success response to prevent error
      return new Response(JSON.stringify({ status: 'queued' }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }
  
  // For message fetching
  if (event.request.method === 'GET') {
    try {
      // Try network first
      const response = await fetch(event.request);
      if (response.ok) {
        // Cache the response
        const cache = await caches.open(CACHE_NAME);
        await cache.put(event.request, response.clone());
        return response;
      }
      throw new Error('Network response was not ok');
    } catch (error) {
      // If offline, return cached messages
      const cachedResponse = await caches.match(event.request);
      if (cachedResponse) {
        return cachedResponse;
      }
      // If no cached messages, return empty array
      return new Response(JSON.stringify([]), {
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }
}

// Handle push notifications
self.addEventListener('push', (event) => {
  const data = event.data.json();
  const options = {
    body: data.body,
    icon: '/pwa-192x192.png',
    badge: '/pwa-192x192.png',
    data: {
      url: data.url
    }
  };
  
  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  event.waitUntil(
    clients.openWindow(event.notification.data.url || '/')
  );
});

// Handle background sync for offline message sending
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-messages') {
    event.waitUntil(syncMessages());
  }
});

// Function to sync messages that were sent while offline
async function syncMessages() {
  try {
    const db = await openDB('selify-offline-db', 1);
    const offlineMessages = await db.getAll('offline-messages');

    // Process each offline message
    for (const message of offlineMessages) {
      try {
        // Attempt to send the message
        const response = await fetch('/api/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(message),
        });

        if (response.ok) {
          // If successful, remove from offline storage
          await db.delete('offline-messages', message.id);
        }
      } catch (error) {
        console.error('Error syncing message:', error);
        // Leave message in storage to try again later
      }
    }
  } catch (error) {
    console.error('Error in syncMessages:', error);
    throw error;
  }
}
