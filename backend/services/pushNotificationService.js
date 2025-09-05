import webpush from 'web-push';
import PushSubscription from '../models/PushSubscription.js';

// Configuración VAPID
const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY || 'BKxT8G9hnzSqfMp_bFnXcqbpnFvPKFHBWAvdBHiMjZ8PTWSrD-koJHkS6fAjEKdd2kMlvzMFC9rrOcVSLs5uNjM';
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY;
const VAPID_SUBJECT = process.env.VAPID_SUBJECT || 'mailto:beniken382carnes@gmail.com';

// Configurar VAPID solo si las claves están disponibles
if (VAPID_PRIVATE_KEY && VAPID_PRIVATE_KEY !== 'your-vapid-private-key-here') {
  try {
    webpush.setVapidDetails(
      VAPID_SUBJECT,
      VAPID_PUBLIC_KEY,
      VAPID_PRIVATE_KEY
    );
    console.log('✅ VAPID configurado correctamente');
  } catch (error) {
    console.warn('⚠️ Error configurando VAPID:', error.message);
    console.warn('📝 Las notificaciones push estarán deshabilitadas hasta configurar claves válidas');
  }
} else {
  console.warn('⚠️ VAPID_PRIVATE_KEY no configurada - notificaciones push deshabilitadas');
  console.warn('📝 Ejecuta "node generate-vapid-keys.js" para generar claves');
}

// Función para generar claves VAPID (solo para desarrollo)
const generateVAPIDKeys = () => {
  return webpush.generateVAPIDKeys();
};

// Registrar nueva suscripción
const registerSubscription = async (subscriptionData) => {
  try {
    const { subscription, userEmail, orderId, userAgent } = subscriptionData;
    
    // Verificar si ya existe una suscripción con el mismo endpoint
    const existingSubscription = await PushSubscription.findOne({
      endpoint: subscription.endpoint
    });

    if (existingSubscription) {
      // Actualizar suscripción existente
      existingSubscription.userEmail = userEmail;
      existingSubscription.orderId = orderId;
      existingSubscription.keys = subscription.keys;
      existingSubscription.userAgent = userAgent;
      existingSubscription.isActive = true;
      
      await existingSubscription.save();
      console.log('Suscripción actualizada:', existingSubscription._id);
      return existingSubscription;
    }

    // Crear nueva suscripción
    const newSubscription = new PushSubscription({
      userEmail,
      orderId,
      endpoint: subscription.endpoint,
      keys: subscription.keys,
      userAgent,
      isActive: true
    });

    await newSubscription.save();
    console.log('Nueva suscripción registrada:', newSubscription._id);
    return newSubscription;

  } catch (error) {
    console.error('Error registrando suscripción:', error);
    throw error;
  }
};

// Desactivar suscripción
const unregisterSubscription = async (userEmail, endpoint) => {
  try {
    const subscription = await PushSubscription.findOne({
      userEmail,
      endpoint,
      isActive: true
    });

    if (subscription) {
      await subscription.deactivate();
      console.log('Suscripción desactivada:', subscription._id);
      return true;
    }

    return false;
  } catch (error) {
    console.error('Error desactivando suscripción:', error);
    throw error;
  }
};

// Enviar notificación push a una suscripción específica
const sendNotificationToSubscription = async (subscription, payload) => {
  // Verificar si VAPID está configurado
  if (!VAPID_PRIVATE_KEY || VAPID_PRIVATE_KEY === 'your-vapid-private-key-here') {
    console.log('⚠️ VAPID no configurado - saltando notificación push');
    return { success: false, error: 'VAPID no configurado' };
  }

  try {
    const pushSubscription = {
      endpoint: subscription.endpoint,
      keys: subscription.keys
    };

    const result = await webpush.sendNotification(
      pushSubscription,
      JSON.stringify(payload),
      {
        TTL: 24 * 60 * 60, // 24 horas
        urgency: 'normal'
      }
    );

    // Actualizar fecha de última notificación
    await PushSubscription.findByIdAndUpdate(subscription._id, {
      lastNotificationSent: new Date()
    });

    console.log('Notificación enviada exitosamente:', result);
    return { success: true, result };

  } catch (error) {
    console.error('Error enviando notificación:', error);
    
    // Si la suscripción es inválida, desactivarla
    if (error.statusCode === 410 || error.statusCode === 404) {
      await PushSubscription.findByIdAndUpdate(subscription._id, {
        isActive: false
      });
      console.log('Suscripción inválida desactivada:', subscription._id);
    }

    return { success: false, error: error.message };
  }
};

// Enviar notificación de confirmación de pedido
const sendOrderConfirmationPush = async (order) => {
  try {
    const subscriptions = await PushSubscription.findByEmail(order.customerEmail);
    
    if (subscriptions.length === 0) {
      console.log('No hay suscripciones para:', order.customerEmail);
      return { sent: 0, failed: 0 };
    }

    const payload = {
      title: '🥩 Beniken - Pedido Confirmado',
      body: `Tu pedido ${order.orderNumber} ha sido confirmado. Total: $${order.totalCLP?.toLocaleString('es-CL')}`,
      tag: `order-confirmation-${order.orderNumber}`,
      orderId: order.orderNumber,
      url: `/track/${order.orderNumber}`,
      icon: '/image/carniceria_beniken.png',
      badge: '/image/carniceria_beniken.png',
      requireInteraction: true,
      vibrate: [200, 100, 200],
      data: {
        type: 'order_confirmation',
        orderId: order.orderNumber,
        orderStatus: order.status
      }
    };

    let sent = 0;
    let failed = 0;

    for (const subscription of subscriptions) {
      const result = await sendNotificationToSubscription(subscription, payload);
      if (result.success) {
        sent++;
      } else {
        failed++;
      }
    }

    console.log(`Notificaciones de confirmación enviadas: ${sent}, fallidas: ${failed}`);
    return { sent, failed };

  } catch (error) {
    console.error('Error enviando notificaciones de confirmación:', error);
    return { sent: 0, failed: 1, error: error.message };
  }
};

// Enviar notificación de cambio de estado
const sendOrderStatusUpdatePush = async (order, newStatus = null) => {
  try {
    const subscriptions = await PushSubscription.findByEmail(order.customerEmail);
    
    if (subscriptions.length === 0) {
      console.log('No hay suscripciones para:', order.customerEmail);
      return { sent: 0, failed: 0 };
    }

    const status = newStatus || order.status;
    
    // Mensajes según el estado
    const statusMessages = {
      'Pendiente pago': {
        title: '⏳ Beniken - Pago Pendiente',
        body: `Tu pedido ${order.orderNumber} está esperando el pago. Total: $${order.totalCLP?.toLocaleString('es-CL')}`,
        icon: '⏳'
      },
      'En preparación': {
        title: '👨‍🍳 Beniken - En Preparación',
        body: `¡Estamos preparando tu pedido ${order.orderNumber}! Te notificaremos cuando esté listo.`,
        icon: '👨‍🍳'
      },
      'Listo': {
        title: '✅ Beniken - Pedido Listo',
        body: `¡Tu pedido ${order.orderNumber} está listo para retirar! Presenta el código QR.`,
        icon: '✅'
      },
      'Entregado': {
        title: '🎉 Beniken - Pedido Entregado',
        body: `¡Tu pedido ${order.orderNumber} ha sido entregado! Gracias por elegirnos.`,
        icon: '🎉'
      }
    };

    const statusInfo = statusMessages[status] || {
      title: '📋 Beniken - Actualización de Pedido',
      body: `Tu pedido ${order.orderNumber} ha sido actualizado a: ${status}`,
      icon: '📋'
    };

    const payload = {
      title: statusInfo.title,
      body: statusInfo.body,
      tag: `order-status-${order.orderNumber}`,
      orderId: order.orderNumber,
      url: `/track/${order.orderNumber}`,
      icon: '/image/carniceria_beniken.png',
      badge: '/image/carniceria_beniken.png',
      requireInteraction: true,
      vibrate: [200, 100, 200, 100, 200],
      data: {
        type: 'status_update',
        orderId: order.orderNumber,
        orderStatus: status,
        previousStatus: order.status
      }
    };

    let sent = 0;
    let failed = 0;

    for (const subscription of subscriptions) {
      const result = await sendNotificationToSubscription(subscription, payload);
      if (result.success) {
        sent++;
      } else {
        failed++;
      }
    }

    console.log(`Notificaciones de estado enviadas: ${sent}, fallidas: ${failed}`);
    return { sent, failed };

  } catch (error) {
    console.error('Error enviando notificaciones de estado:', error);
    return { sent: 0, failed: 1, error: error.message };
  }
};

// Enviar notificación de confirmación de pago
const sendPaymentConfirmationPush = async (order) => {
  try {
    const subscriptions = await PushSubscription.findByEmail(order.customerEmail);
    
    if (subscriptions.length === 0) {
      console.log('No hay suscripciones para:', order.customerEmail);
      return { sent: 0, failed: 0 };
    }

    const payload = {
      title: '💳 Beniken - Pago Confirmado',
      body: `¡Pago confirmado para tu pedido ${order.orderNumber}! Comenzamos la preparación.`,
      tag: `payment-confirmation-${order.orderNumber}`,
      orderId: order.orderNumber,
      url: `/track/${order.orderNumber}`,
      icon: '/image/carniceria_beniken.png',
      badge: '/image/carniceria_beniken.png',
      requireInteraction: true,
      vibrate: [300, 100, 300],
      data: {
        type: 'payment_confirmation',
        orderId: order.orderNumber,
        orderStatus: order.status
      }
    };

    let sent = 0;
    let failed = 0;

    for (const subscription of subscriptions) {
      const result = await sendNotificationToSubscription(subscription, payload);
      if (result.success) {
        sent++;
      } else {
        failed++;
      }
    }

    console.log(`Notificaciones de pago enviadas: ${sent}, fallidas: ${failed}`);
    return { sent, failed };

  } catch (error) {
    console.error('Error enviando notificaciones de pago:', error);
    return { sent: 0, failed: 1, error: error.message };
  }
};

// Limpiar suscripciones inactivas
const cleanupInactiveSubscriptions = async () => {
  try {
    const result = await PushSubscription.cleanupOldSubscriptions(30);
    console.log(`Limpieza completada: ${result.deletedCount} suscripciones eliminadas`);
    return result;
  } catch (error) {
    console.error('Error en limpieza de suscripciones:', error);
    throw error;
  }
};

export {
  generateVAPIDKeys,
  registerSubscription,
  unregisterSubscription,
  sendOrderConfirmationPush,
  sendOrderStatusUpdatePush,
  sendPaymentConfirmationPush,
  cleanupInactiveSubscriptions,
  VAPID_PUBLIC_KEY
};
