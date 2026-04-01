// ====================================
// Service Worker v2 — Japan Trip PWA
// Стратегия: Stale-While-Revalidate
// - Всегда отдаём из кэша (быстро + offline)
// - Одновременно обновляем кэш из сети
// ====================================

const CACHE_NAME = 'japan-trip-v3';

// Все страницы и ресурсы для кэширования
const CACHE_ASSETS = [
    './',
    './index.html',
    './osaka.html',
    './fuji.html',
    './tokyo.html',
    './shanghai.html',
    './budget.html',
    './toilet-map.html',
    './visa.html',
    './contacts.html',
    './glossary.html',
    './CSS/style.css',
    './js/currency.js',
    './js/app.js',
    './manifest.json'
];

// ── УСТАНОВКА: кэшируем все ресурсы ──
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            console.log('[SW] Кэширование всех ресурсов...');
            return cache.addAll(CACHE_ASSETS);
        }).catch(err => console.error('[SW] Ошибка кэширования:', err))
    );
    self.skipWaiting(); // Активируем немедленно, без ожидания
});

// ── АКТИВАЦИЯ: удаляем старые кэши ──
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames
                    .filter(name => name !== CACHE_NAME)
                    .map(name => {
                        console.log('[SW] Удаляем старый кэш:', name);
                        return caches.delete(name);
                    })
            );
        })
    );
    self.clients.claim(); // Берём контроль над всеми вкладками
});

// ── FETCH: Stale-While-Revalidate ──
self.addEventListener('fetch', event => {
    // Обрабатываем только GET-запросы
    if (event.request.method !== 'GET') return;

    const url = new URL(event.request.url);

    // Для внешних API валют — только сеть (без кэша)
    if (url.hostname.includes('jsdelivr.net') ||
        url.hostname.includes('exchangerate') ||
        url.hostname.includes('googleapis.com')) {
        event.respondWith(fetch(event.request).catch(() => new Response('')));
        return;
    }

    event.respondWith(
        caches.open(CACHE_NAME).then(cache => {
            return cache.match(event.request).then(cachedResponse => {

                // Фоновое обновление кэша (если есть сеть)
                const fetchAndUpdate = fetch(event.request).then(networkResponse => {
                    if (networkResponse && networkResponse.ok) {
                        cache.put(event.request, networkResponse.clone());
                        // Уведомляем все вкладки об обновлении
                        self.clients.matchAll().then(clients => {
                            clients.forEach(client => {
                                client.postMessage({
                                    type: 'CACHE_UPDATED',
                                    url: event.request.url
                                });
                            });
                        });
                    }
                    return networkResponse;
                }).catch(() => null);

                // Если есть кэш — сразу отдаём, обновляем в фоне
                if (cachedResponse) {
                    fetchAndUpdate; // запускаем в фоне, не ждём
                    return cachedResponse;
                }

                // Если кэша нет — ждём сеть
                return fetchAndUpdate.then(response => response || new Response('Offline: страница не найдена', {
                    status: 503,
                    headers: { 'Content-Type': 'text/plain; charset=utf-8' }
                }));
            });
        })
    );
});

// ── Сообщение от страницы: принудительно обновить кэш ──
self.addEventListener('message', event => {
    if (event.data && event.data.type === 'FORCE_UPDATE') {
        caches.open(CACHE_NAME).then(cache => {
            return Promise.all(
                CACHE_ASSETS.map(url =>
                    fetch(url).then(response => {
                        if (response.ok) cache.put(url, response);
                    }).catch(() => {})
                )
            );
        }).then(() => {
            event.source.postMessage({ type: 'CACHE_REFRESHED' });
        });
    }
});
