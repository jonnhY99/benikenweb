import React, { useState, useEffect } from 'react';
import { 
  subscribeToPushNotifications, 
  unsubscribeFromPushNotifications, 
  getSubscriptionStatus,
  showTestNotification,
  isNotificationSupported 
} from '../utils/pushNotifications';

const NotificationSettings = ({ userEmail, orderId = null, onClose }) => {
  const [subscriptionStatus, setSubscriptionStatus] = useState({
    supported: false,
    subscribed: false,
    permission: 'default'
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('info'); // 'success', 'error', 'info'

  useEffect(() => {
    checkSubscriptionStatus();
  }, []);

  const checkSubscriptionStatus = async () => {
    const status = await getSubscriptionStatus();
    setSubscriptionStatus(status);
  };

  const showMessage = (text, type = 'info') => {
    setMessage(text);
    setMessageType(type);
    setTimeout(() => setMessage(''), 5000);
  };

  const handleSubscribe = async () => {
    if (!userEmail) {
      showMessage('Se requiere un email para activar las notificaciones', 'error');
      return;
    }

    setLoading(true);
    try {
      const result = await subscribeToPushNotifications(userEmail, orderId);
      
      if (result.success) {
        showMessage(result.message, 'success');
        await checkSubscriptionStatus();
      } else {
        showMessage(result.error, 'error');
      }
    } catch (error) {
      showMessage('Error al activar notificaciones: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleUnsubscribe = async () => {
    setLoading(true);
    try {
      const result = await unsubscribeFromPushNotifications(userEmail);
      
      if (result.success) {
        showMessage(result.message, 'success');
        await checkSubscriptionStatus();
      } else {
        showMessage(result.error, 'error');
      }
    } catch (error) {
      showMessage('Error al desactivar notificaciones: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleTestNotification = async () => {
    setLoading(true);
    try {
      const result = await showTestNotification();
      
      if (result.success) {
        showMessage(result.message, 'success');
      } else {
        showMessage(result.error, 'error');
      }
    } catch (error) {
      showMessage('Error al enviar notificación de prueba: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const getPermissionText = () => {
    switch (subscriptionStatus.permission) {
      case 'granted':
        return { text: 'Permitidas', color: 'text-green-600', icon: '✅' };
      case 'denied':
        return { text: 'Bloqueadas', color: 'text-red-600', icon: '❌' };
      case 'default':
        return { text: 'Sin configurar', color: 'text-yellow-600', icon: '⚠️' };
      default:
        return { text: 'No soportadas', color: 'text-gray-600', icon: '❓' };
    }
  };

  const permissionInfo = getPermissionText();

  if (!isNotificationSupported()) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl max-w-md w-full p-6">
          <div className="text-center">
            <div className="text-6xl mb-4">📱</div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              Notificaciones no soportadas
            </h3>
            <p className="text-gray-600 mb-6">
              Tu navegador no soporta notificaciones push. 
              Intenta usar Chrome, Firefox o Safari actualizado.
            </p>
            <button
              onClick={onClose}
              className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition-colors"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-gray-800">
            🔔 Notificaciones Push
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            ×
          </button>
        </div>

        {/* Estado actual */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <h4 className="font-semibold text-gray-700 mb-3">Estado actual:</h4>
          
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Soporte:</span>
              <span className={subscriptionStatus.supported ? 'text-green-600' : 'text-red-600'}>
                {subscriptionStatus.supported ? '✅ Soportado' : '❌ No soportado'}
              </span>
            </div>
            
            <div className="flex justify-between">
              <span>Permisos:</span>
              <span className={permissionInfo.color}>
                {permissionInfo.icon} {permissionInfo.text}
              </span>
            </div>
            
            <div className="flex justify-between">
              <span>Suscripción:</span>
              <span className={subscriptionStatus.subscribed ? 'text-green-600' : 'text-gray-600'}>
                {subscriptionStatus.subscribed ? '✅ Activa' : '⭕ Inactiva'}
              </span>
            </div>
          </div>
        </div>

        {/* Mensaje de estado */}
        {message && (
          <div className={`p-3 rounded-lg mb-4 text-sm ${
            messageType === 'success' ? 'bg-green-100 text-green-700 border border-green-200' :
            messageType === 'error' ? 'bg-red-100 text-red-700 border border-red-200' :
            'bg-blue-100 text-blue-700 border border-blue-200'
          }`}>
            {message}
          </div>
        )}

        {/* Información */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h4 className="font-semibold text-blue-800 mb-2">
            📲 ¿Qué son las notificaciones push?
          </h4>
          <p className="text-blue-700 text-sm">
            Recibe notificaciones nativas en tu dispositivo cuando tu pedido cambie de estado. 
            Funcionan incluso cuando el navegador está cerrado.
          </p>
        </div>

        {/* Botones de acción */}
        <div className="space-y-3">
          {!subscriptionStatus.subscribed ? (
            <button
              onClick={handleSubscribe}
              disabled={loading || subscriptionStatus.permission === 'denied'}
              className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Activando...
                </div>
              ) : (
                '🔔 Activar Notificaciones'
              )}
            </button>
          ) : (
            <button
              onClick={handleUnsubscribe}
              disabled={loading}
              className="w-full bg-red-600 text-white py-3 px-4 rounded-lg hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Desactivando...
                </div>
              ) : (
                '🔕 Desactivar Notificaciones'
              )}
            </button>
          )}

          {subscriptionStatus.subscribed && (
            <button
              onClick={handleTestNotification}
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Enviando...
                </div>
              ) : (
                '🧪 Probar Notificación'
              )}
            </button>
          )}

          {subscriptionStatus.permission === 'denied' && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <p className="text-yellow-800 text-sm">
                <strong>⚠️ Permisos bloqueados:</strong> Para activar las notificaciones, 
                debes permitirlas en la configuración de tu navegador.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center">
            Las notificaciones te ayudarán a estar al día con el estado de tu pedido
          </p>
        </div>
      </div>
    </div>
  );
};

export default NotificationSettings;
