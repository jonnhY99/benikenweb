// Service Worker para Web Push Notifications - Beniken
const CACHE_NAME = 'beniken-v1';

self.addEventListener('install', event => {
  console.log('Service Worker instalado');
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  console.log('Service Worker activado');
  event.waitUntil(self.clients.claim());
});

// Manejar notificaciones push
self.addEventListener('push', event => {
  console.log('Push notification recibida:', event);
  
  const data = event.data ? event.data.json() : {};
  const title = data.title || '🥩 Beniken - Carnes Premium';
  
  const options = {
    body: data.body || 'Tienes una actualización de tu pedido',
    icon: '/image/carniceria_beniken.png',
    badge: '/image/carniceria_beniken.png',
    tag: data.tag || 'beniken-notification',
    requireInteraction: true, // Mantiene la notificación visible hasta que el usuario interactúe
    vibrate: [200, 100, 200], // Patrón de vibración para móviles
    actions: [
      {
        action: 'view',
        title: '👀 Ver pedido',
        icon: '/image/carniceria_beniken.png'
      },
      {
        action: 'dismiss',
        title: '❌ Cerrar',
        icon: '/image/carniceria_beniken.png'
      }
    ],
    data: {
      url: data.url || '/',
      orderId: data.orderId,
      timestamp: Date.now(),
      ...data
    }
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// Manejar clicks en notificaciones
self.addEventListener('notificationclick', event => {
  console.log('Notification click:', event);
  
  event.notification.close();
  
  const notificationData = event.notification.data;
  let urlToOpen = '/';
  
  // Determinar URL según la acción
  if (event.action === 'view' && notificationData.orderId) {
    urlToOpen = `/track/${notificationData.orderId}`;
  } else if (event.action === 'dismiss') {
    return; // Solo cerrar la notificación
  } else if (notificationData.url) {
    urlToOpen = notificationData.url;
  }
  
  // Abrir o enfocar ventana
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then(clientList => {
        // Buscar si ya hay una ventana abierta
        for (const client of clientList) {
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            client.focus();
            client.navigate(urlToOpen);
            return;
          }
        }
        
        // Si no hay ventana abierta, crear una nueva
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
  );
});

// Manejar cierre de notificaciones
self.addEventListener('notificationclose', event => {
  console.log('Notification closed:', event.notification.data);
});
