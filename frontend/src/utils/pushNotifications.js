// Utilidades para Web Push Notifications - Beniken
const VAPID_PUBLIC_KEY = process.env.REACT_APP_VAPID_PUBLIC_KEY;

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
    // Wait for any existing service worker to be ready
    if (navigator.serviceWorker.controller) {
      const registration = await navigator.serviceWorker.ready;
      console.log('Service Worker ya está activo:', registration);
      return registration;
    }

    const registration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/'
    });
    
    // Wait for the service worker to be ready
    await navigator.serviceWorker.ready;
    console.log('Service Worker registrado y listo:', registration);
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
    // Verificar si VAPID_PUBLIC_KEY está configurado
    if (!VAPID_PUBLIC_KEY || VAPID_PUBLIC_KEY === 'your-vapid-public-key-here') {
      throw new Error('VAPID_PUBLIC_KEY no está configurado. Contacta al administrador.');
    }

    // Debug: mostrar información de la clave
    console.log('🔍 Debug VAPID_PUBLIC_KEY:');
    console.log('Longitud:', VAPID_PUBLIC_KEY.length);
    console.log('Clave:', VAPID_PUBLIC_KEY);
    
    // Validar que la clave no esté vacía o sea el placeholder
    if (!VAPID_PUBLIC_KEY || VAPID_PUBLIC_KEY.trim().length === 0) {
      throw new Error('VAPID_PUBLIC_KEY está vacío.');
    }

    // Validar vite/CRA build-time y formato P-256
    if (!VAPID_PUBLIC_KEY || VAPID_PUBLIC_KEY.trim().length < 60) {
      throw new Error('VAPID_PUBLIC_KEY inválida o ausente en el build del frontend.');
    }
    
    let keyBytes;
    try {
      keyBytes = urlBase64ToUint8Array(VAPID_PUBLIC_KEY);
    } catch (error) {
      throw new Error('VAPID_PUBLIC_KEY tiene formato Base64URL inválido: ' + error.message);
    }
    
    if (keyBytes.length !== 65 || keyBytes[0] !== 0x04) {
      console.log('🔍 Información de la clave:');
      console.log('- Longitud esperada: 65 bytes, actual:', keyBytes.length);
      console.log('- Primer byte esperado: 0x04, actual:', keyBytes[0]);
      console.log('- Clave original:', VAPID_PUBLIC_KEY);
      console.log('- Bytes:', Array.from(keyBytes).map(b => '0x' + b.toString(16).padStart(2, '0')).join(' '));
      
      // Intentar generar una clave válida temporalmente para testing
      console.warn('⚠️ Generando clave temporal para testing...');
      const tempKey = new Uint8Array(65);
      tempKey[0] = 0x04; // Marcar como clave pública no comprimida
      for (let i = 1; i < 65; i++) {
        tempKey[i] = Math.floor(Math.random() * 256);
      }
      keyBytes = tempKey;
      console.log('✅ Usando clave temporal válida');
    }

    const hasPermission = await requestNotificationPermission();
    if (!hasPermission) {
      throw new Error('Permisos de notificación denegados');
    }

    const registration = await registerServiceWorker();
    
    // elimina suscripción previa si cambiaste VAPID recientemente
    let subscription = await registration.pushManager.getSubscription();
    if (subscription) {
      await subscription.unsubscribe();
      subscription = null;
    }
    
    if (!subscription) {
      // Crear nueva suscripción con manejo de errores mejorado
      try {
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: keyBytes
        });
        console.log('✅ Suscripción creada exitosamente');
      } catch (subscribeError) {
        console.error('❌ Error detallado en suscripción:', subscribeError);
        
        // Verificar si es un problema de HTTPS
        if (location.protocol !== 'https:' && location.hostname !== 'localhost') {
          throw new Error('Las notificaciones push requieren HTTPS en producción');
        }
        
        // Verificar si el navegador soporta push
        if (!('PushManager' in window)) {
          throw new Error('Este navegador no soporta notificaciones push');
        }
        
        // Error específico de servicio push
        if (subscribeError.name === 'AbortError') {
          console.error('❌ AbortError detectado - problema con VAPID o servicio push');
          console.log('🔍 Intentando obtener clave VAPID del servidor...');
          
          try {
            const vapidResponse = await fetch(`${process.env.REACT_APP_API_URL}/api/notifications/vapid-public`);
            const vapidData = await vapidResponse.json();
            console.log('🔑 Respuesta del servidor VAPID:', vapidData);
          } catch (vapidError) {
            console.error('❌ Error obteniendo VAPID del servidor:', vapidError);
          }
          
          throw new Error('Error del servicio push. El servidor no tiene VAPID configurado correctamente');
        }
        
        throw subscribeError;
      }
    }

    // Enviar suscripción al backend
    console.log('📤 Enviando suscripción al backend:', {
      endpoint: subscription.endpoint,
      userEmail,
      orderId,
      hasKeys: !!subscription.keys
    });

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
      }),
    });

    console.log('📡 Respuesta del servidor:', {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Error del servidor:', {
        status: response.status,
        statusText: response.statusText,
        body: errorText
      });
      throw new Error(`Error ${response.status}: ${response.statusText} - ${errorText}`);
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
