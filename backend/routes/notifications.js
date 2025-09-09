import express from 'express';
import { 
  registerSubscription, 
  unregisterSubscription,
  VAPID_PUBLIC_KEY 
} from '../services/pushNotificationService.js';

const router = express.Router();

// Obtener clave pública VAPID
router.get('/vapid-public', (req, res) => {
  try {
    res.json({ 
      publicKey: VAPID_PUBLIC_KEY,
      success: true 
    });
  } catch (error) {
    console.error('Error obteniendo clave VAPID:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Error del servidor' 
    });
  }
});

// Suscribirse a notificaciones push
router.post('/subscribe', async (req, res) => {
  try {
    console.log('📥 Recibida solicitud de suscripción:', {
      hasSubscription: !!req.body.subscription,
      userEmail: req.body.userEmail,
      orderId: req.body.orderId,
      userAgent: req.body.userAgent?.substring(0, 50) + '...'
    });

    const { subscription, userEmail, orderId, userAgent } = req.body;

    if (!subscription || !subscription.endpoint || !subscription.keys) {
      console.error('❌ Datos de suscripción inválidos:', subscription);
      return res.status(400).json({
        success: false,
        error: 'Datos de suscripción inválidos'
      });
    }

    if (!userEmail) {
      console.error('❌ Email de usuario faltante');
      return res.status(400).json({
        success: false,
        error: 'Email de usuario requerido'
      });
    }

    const result = await registerSubscription({
      subscription,
      userEmail,
      orderId,
      userAgent
    });

    console.log('Suscripción registrada exitosamente:', {
      id: result._id,
      email: userEmail,
      orderId: orderId || 'N/A'
    });

    res.json({
      success: true,
      message: 'Suscripción registrada correctamente',
      subscriptionId: result._id
    });

  } catch (error) {
    console.error('Error registrando suscripción:', error);
    res.status(500).json({
      success: false,
      error: 'Error al registrar suscripción'
    });
  }
});

// Desuscribirse de notificaciones push
router.post('/unsubscribe', async (req, res) => {
  try {
    const { userEmail, endpoint } = req.body;

    if (!userEmail || !endpoint) {
      return res.status(400).json({
        success: false,
        error: 'Email y endpoint requeridos'
      });
    }

    const result = await unregisterSubscription(userEmail, endpoint);

    if (result) {
      console.log('Suscripción desactivada exitosamente:', userEmail);
      res.json({
        success: true,
        message: 'Suscripción desactivada correctamente'
      });
    } else {
      res.json({
        success: true,
        message: 'No se encontró suscripción activa'
      });
    }

  } catch (error) {
    console.error('Error desactivando suscripción:', error);
    res.status(500).json({
      success: false,
      error: 'Error al desactivar suscripción'
    });
  }
});

// Endpoint de prueba para verificar funcionamiento
router.post('/test', async (req, res) => {
  try {
    const { userEmail } = req.body;

    if (!userEmail) {
      return res.status(400).json({
        success: false,
        error: 'Email requerido para prueba'
      });
    }

    // Aquí podrías enviar una notificación de prueba
    res.json({
      success: true,
      message: 'Endpoint de notificaciones funcionando correctamente',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error en prueba de notificaciones:', error);
    res.status(500).json({
      success: false,
      error: 'Error en prueba'
    });
  }
});

export default router;
