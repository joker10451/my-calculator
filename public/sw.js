// Service Worker для кеширования статей блога
const CACHE_NAME = 'schitay-blog-v2';
const ARTICLE_CACHE_NAME = 'schitay-articles-v2';
const SEARCH_CACHE_NAME = 'schitay-search-v2';

// Ресурсы для кеширования при установке
const STATIC_RESOURCES = [
  '/',
  '/blog',
  '/index.html',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
];

// Установка Service Worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_RESOURCES);
    })
  );
  self.skipWaiting();
});

// Активация Service Worker
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => {
            return name !== CACHE_NAME && 
                   name !== ARTICLE_CACHE_NAME && 
                   name !== SEARCH_CACHE_NAME;
          })
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

// Обработка запросов
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Кешируем только GET запросы
  if (request.method !== 'GET') {
    return;
  }

  // Не кешируем API запросы
  if (url.pathname.includes('/api/')) {
    return;
  }

  // Кешируем статьи блога
  if (url.pathname.startsWith('/blog/')) {
    event.respondWith(
      caches.open(ARTICLE_CACHE_NAME).then((cache) => {
        return cache.match(request).then((cachedResponse) => {
          if (cachedResponse) {
            // Возвращаем из кеша и обновляем в фоне
            fetch(request).then((networkResponse) => {
              if (networkResponse && networkResponse.status === 200) {
                cache.put(request, networkResponse.clone());
              }
            }).catch(() => {
              // Игнорируем ошибки фонового обновления
            });
            return cachedResponse;
          }

          // Загружаем из сети и кешируем
          return fetch(request).then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              cache.put(request, networkResponse.clone());
            }
            return networkResponse;
          }).catch((error) => {
            // Возвращаем кешированную версию если есть
            return cache.match(request) || Promise.reject(error);
          });
        });
      })
    );
    return;
  }

  // Кешируем результаты поиска (с TTL 5 минут)
  if (url.pathname.includes('/search') || url.searchParams.has('q')) {
    event.respondWith(
      caches.open(SEARCH_CACHE_NAME).then((cache) => {
        return cache.match(request).then((cachedResponse) => {
          if (cachedResponse) {
            const cachedDate = new Date(cachedResponse.headers.get('sw-cached-date'));
            const now = new Date();
            const age = (now - cachedDate) / 1000; // в секундах

            // Если кеш старше 5 минут, обновляем
            if (age < 300) {
              return cachedResponse;
            }
          }

          // Загружаем из сети и кешируем
          return fetch(request).then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              const responseToCache = networkResponse.clone();
              const headers = new Headers(responseToCache.headers);
              headers.append('sw-cached-date', new Date().toISOString());

              const modifiedResponse = new Response(responseToCache.body, {
                status: responseToCache.status,
                statusText: responseToCache.statusText,
                headers: headers,
              });

              cache.put(request, modifiedResponse);
            }
            return networkResponse;
          }).catch((error) => {
            // Возвращаем кешированную версию если есть
            return cache.match(request) || Promise.reject(error);
          });
        });
      })
    );
    return;
  }

  // Для остальных GET запросов - стандартная стратегия Network First
  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response && response.status === 200 && request.url.startsWith('http')) {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseToCache);
          }).catch(() => {
            // Игнорируем ошибки кеширования
          });
        }
        return response;
      })
      .catch(() => {
        return caches.match(request);
      })
  );
});

// Обработка сообщений от клиента
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  if (event.data && event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((name) => caches.delete(name))
        );
      })
    );
  }
});
