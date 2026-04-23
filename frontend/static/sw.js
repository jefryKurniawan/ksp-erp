const CACHE_NAME = 'ksp-erp-cache-v1';
const DB_NAME = 'ksp-offline-db';
const SYNC_STORE = 'sync_queue';

// Install SW
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll([
        '/',
        '/dashboard',
        '/members',
        '/savings',
        '/loans',
        '/reports',
      ]);
    })
  );
  self.skipWaiting();
});

// Activate SW
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

// Fetch handler - tambahkan check untuk chrome-extension
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip chrome-extension requests
  if (url.protocol === 'chrome-extension:') {
    return;
  }
  
  if (request.method !== 'GET') {
    event.respondWith(handleMutation(request));
    return;
  }
  
  if (url.pathname.startsWith('/api/') || url.pathname.startsWith('/reports/')) {
    event.respondWith(networkFirst(request));
  } else {
    event.respondWith(cacheFirst(request));
  }
});

async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;
  
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    return new Response('Offline', { status: 503 });
  }
}

async function networkFirst(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    const cached = await caches.match(request);
    if (cached) return cached;
    return new Response(JSON.stringify({ error: 'Offline' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

async function handleMutation(request) {
  const url = new URL(request.url);
  const clonedRequest = request.clone();
  
  try {
    const body = await clonedRequest.json().catch(() => ({}));
    console.log('📝 SW: Queuing mutation:', {
      url: url.pathname,
      method: request.method,
      body: body
    });
    
    const queued = await queueMutation({
      id: crypto.randomUUID(),
      endpoint: url.pathname,
      method: request.method,
      body,
      timestamp: Date.now(),
      status: 'pending',
      retry: 0
    });
    
    console.log('✅ SW: Queued successfully:', queued);
    
    return new Response(JSON.stringify({ 
      success: true, 
      offline: true,
      message: 'Queued for sync' 
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('❌ SW: Failed to queue:', error);
    throw error;
  }
}

// IndexedDB helpers dengan logging
function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onerror = () => {
      console.error('❌ SW: Failed to open DB');
      reject(request.error);
    };
    request.onsuccess = () => {
      console.log('✅ SW: DB opened');
      resolve(request.result);
    };
    request.onupgradeneeded = (event) => {
      console.log('🔧 SW: DB upgrade needed');
      const db = event.target.result;
      if (!db.objectStoreNames.contains(SYNC_STORE)) {
        console.log('📦 SW: Creating sync_queue store');
        db.createObjectStore(SYNC_STORE, { keyPath: 'id' });
      }
    };
  });
}

async function queueMutation(data) {
  console.log('💾 SW: queueMutation called with:', data);
  
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(SYNC_STORE, 'readwrite');
    const store = tx.objectStore(SYNC_STORE);
    const request = store.add(data);
    
    request.onsuccess = () => {
      console.log('✅ SW: Data added to IndexedDB:', request.result);
      resolve(request.result);
    };
    request.onerror = () => {
      console.error('❌ SW: Failed to add data:', request.error);
      reject(request.error);
    };
  });
}
// Background sync
async function syncPending() {
  if (!navigator.onLine) return;
  
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(SYNC_STORE, 'readwrite');
    const store = tx.objectStore(SYNC_STORE);
    const request = store.getAll();
    
    request.onsuccess = async () => {
      const pending = request.result.filter(r => r.status === 'pending');
      
      for (const item of pending) {
        try {
          const response = await fetch(item.endpoint, {
            method: item.method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(item.body)
          });
          
          if (response.ok) {
            item.status = 'synced';
            store.put(item);
          }
        } catch (error) {
          item.retry = (item.retry || 0) + 1;
          if (item.retry >= 3) {
            item.status = 'failed';
          }
          store.put(item);
        }
      }
      resolve();
    };
    
    request.onerror = () => reject(request.error);
  });
}

self.addEventListener('online', syncPending);
setInterval(syncPending, 30000);