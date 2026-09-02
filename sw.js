/**
 * MathPad Junior - Progressive Web App (PWA) Service Worker
 * Provides full offline support, caching app shell, styles, fonts, and assets.
 */

const CACHE_NAME = 'mathpad-junior-v0.17';

const PRECACHE_ASSETS = [
  './',
  './index.html',
  './pencil_case.html',
  './manifest.json',
  './css/main.css',
  './css/base.css',
  './css/workbook.css',
  './css/canvas.css',
  './css/components/components.css',
  './css/components/keypad.css',
  './css/components/stepGuide.css',
  './js/main.js',
  './js/data/curricula.js',
  './js/data/curricula.json',
  './js/data/studentProgress.js',
  './js/data/pencilCaseData.js',
  './js/core/audioManager.js',
  './js/core/canvasEngine.js',
  './js/core/historyManager.js',
  './js/components/numKeypad.js',
  './js/components/stepGuideModal.js',
  './js/math/validator.js',
  './js/math/divisionEngine.js',
  './js/math/diagnosisEngine.js',
  './js/math/ocrHandler.js',
  './js/math/proceduralGenerator.js',
  './js/pages/coverPage.js',
  './js/pages/practicePage.js',
  './js/pages/pageManager.js',
  './media/logo/android_app_logo.svg',
  './media/logo/mathpad_junior_logo_designs.svg'
];

// 1. Install Event: Cache Core App Shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS);
    }).then(() => self.skipWaiting())
  );
});

// 2. Activate Event: Clean up outdated caches & take immediate control
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// 3. Fetch Event: Cache-First for static assets, Network-First for dynamic / external
self.addEventListener('fetch', (event) => {
  const requestUrl = new URL(event.request.url);

  // Exclude non-GET requests or Google inputtools OCR API from caching
  if (event.request.method !== 'GET' || requestUrl.hostname.includes('inputtools.google.com')) {
    return;
  }

  // Handle Google Fonts stylesheets & webfonts (Stale-While-Revalidate)
  if (requestUrl.hostname.includes('fonts.googleapis.com') || requestUrl.hostname.includes('fonts.gstatic.com')) {
    event.respondWith(
      caches.open(CACHE_NAME).then(async (cache) => {
        const cachedResponse = await cache.match(event.request);
        const fetchPromise = fetch(event.request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            cache.put(event.request, networkResponse.clone());
          }
          return networkResponse;
        }).catch(() => cachedResponse);

        return cachedResponse || fetchPromise;
      })
    );
    return;
  }

  // Standard App Assets: Cache-first, fallback to network
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        // Fetch fresh copy in background for continuous updates
        fetch(event.request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, networkResponse);
            });
          }
        }).catch(() => {});
        return cachedResponse;
      }

      return fetch(event.request).then((networkResponse) => {
        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
          return networkResponse;
        }

        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });

        return networkResponse;
      }).catch(() => {
        // Offline fallback for navigation requests
        if (event.request.mode === 'navigate') {
          return caches.match('./index.html');
        }
      });
    })
  );
});
