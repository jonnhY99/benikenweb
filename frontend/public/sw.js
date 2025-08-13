self.addEventListener('push', event => {
  const data = event.data ? event.data.json() : {};
  const title = data.title || 'Beniken';
  const options = {
    body: data.body || '',
    icon: '/image/carniceria_beniken.png',
    badge: '/image/carniceria_beniken.png',
    data
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(clients.openWindow('/')); // redirige al sitio
});
