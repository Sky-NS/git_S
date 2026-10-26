// Раньше сайт регистрировал service worker, который отдавал старые файлы из кэша.
// Эта версия чистит кэш и снимает регистрацию у гостей, которые уже открывали сайт.
self.addEventListener('install', () => self.skipWaiting());

self.addEventListener('activate', (event) => {
    event.waitUntil((async () => {
        const keys = await caches.keys();
        await Promise.all(keys.map((key) => caches.delete(key)));
        await self.registration.unregister();
        const clients = await self.clients.matchAll({ type: 'window' });
        clients.forEach((client) => client.navigate(client.url));
    })());
});
