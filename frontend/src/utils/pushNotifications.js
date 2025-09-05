// Utilidades para Web Push Notifications - Beniken
const VAPID_PUBLIC_KEY = process.env.REACT_APP_VAPID_PUBLIC_KEY || 'BKxT8G9hnzSqfMp_bFnXcqbpnFvPKFHBWAvdBHiMjZ8PTWSrD-koJHkS6fAjEKdd2kMlvzMFC9rrOcVSLs5uNjM';

// Convertir VAPID key a Uint8Array
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

// Verificar soporte de notificaciones
export const isNotificationSupported = () => {
  return 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
};

// Registrar Service Worker
export const registerServiceWorker = async () => {
  if (!isNotificationSupported()) {
    throw new Error('Las notificaciones push no están soportadas en este navegador');
  }

  try {
    const registration = await navigator.serviceWorker.register('/sw.js');
    console.log('Service Worker registrado:', registration);
    return registration;
  } catch (error) {
    console.error('Error registrando Service Worker:', error);
    throw error;
  }
};

// Solicitar permisos de notificación
export const requestNotificationPermission = async () => {
  if (!isNotificationSupported()) {
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission === 'denied') {
    return false;
  }

  const permission = await Notification.requestPermission();
  return permission === 'granted';
};

// Suscribirse a notificaciones push
export const subscribeToPushNotifications = async (userEmail, orderId = null) => {
  try {
    const hasPermission = await requestNotificationPermission();
    if (!hasPermission) {
      throw new Error('Permisos de notificación denegados');
    }

    const registration = await registerServiceWorker();
    
    // Verificar si ya existe una suscripción
    let subscription = await registration.pushManager.getSubscription();
    
    if (!subscription) {
      // Crear nueva suscripción
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
      });
    }

    // Enviar suscripción al backend
    const response = await fetch(`${process.env.REACT_APP_API_URL}/api/notifications/subscribe`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        subscription,
        userEmail,
        orderId,
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString()
      })
    });

    if (!response.ok) {
      throw new Error('Error al registrar suscripción en el servidor');
    }

    const result = await response.json();
    console.log('Suscripción registrada exitosamente:', result);
    
    return {
      success: true,
      subscription,
      message: 'Notificaciones activadas correctamente'
    };

  } catch (error) {
    console.error('Error suscribiéndose a notificaciones:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Desuscribirse de notificaciones
export const unsubscribeFromPushNotifications = async (userEmail) => {
  try {
    const registration = await navigator.serviceWorker.getRegistration();
    if (!registration) {
      return { success: true, message: 'No hay suscripción activa' };
    }

    const subscription = await registration.pushManager.getSubscription();
    if (!subscription) {
      return { success: true, message: 'No hay suscripción activa' };
    }

    // Desuscribir del navegador
    await subscription.unsubscribe();

    // Notificar al backend
    await fetch(`${process.env.REACT_APP_API_URL}/api/notifications/unsubscribe`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userEmail,
        endpoint: subscription.endpoint
      })
    });

    return {
      success: true,
      message: 'Notificaciones desactivadas correctamente'
    };

  } catch (error) {
    console.error('Error desuscribiéndose:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Verificar estado de suscripción
export const getSubscriptionStatus = async () => {
  try {
    if (!isNotificationSupported()) {
      return { supported: false, subscribed: false, permission: 'unsupported' };
    }

    const registration = await navigator.serviceWorker.getRegistration();
    const subscription = registration ? await registration.pushManager.getSubscription() : null;

    return {
      supported: true,
      subscribed: !!subscription,
      permission: Notification.permission,
      subscription
    };

  } catch (error) {
    console.error('Error verificando estado de suscripción:', error);
    return { supported: false, subscribed: false, permission: 'error' };
  }
};

// Mostrar notificación de prueba (solo para desarrollo)
export const showTestNotification = async () => {
  try {
    const hasPermission = await requestNotificationPermission();
    if (!hasPermission) {
      throw new Error('Permisos de notificación denegados');
    }

    const registration = await registerServiceWorker();
    
    await registration.showNotification('🥩 Beniken - Prueba', {
      body: 'Esta es una notificación de prueba para verificar que todo funciona correctamente',
      icon: '/image/carniceria_beniken.png',
      badge: '/image/carniceria_beniken.png',
      tag: 'test-notification',
      requireInteraction: false,
      vibrate: [200, 100, 200],
      actions: [
        {
          action: 'view',
          title: '👀 Ver',
          icon: '/image/carniceria_beniken.png'
        }
      ]
    });

    return { success: true, message: 'Notificación de prueba enviada' };

  } catch (error) {
    console.error('Error mostrando notificación de prueba:', error);
    return { success: false, error: error.message };
  }
};
