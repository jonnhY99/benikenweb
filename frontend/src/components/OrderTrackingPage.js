import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import NotificationSettings from './NotificationSettings';
import { fetchOrderById } from '../api/orders';
import OrderQRCode from './OrderQRCode';

const StatusBadge = ({ status }) => {
  const color =
    status === 'Listo'
      ? 'bg-green-100 text-green-800'
      : status === 'Entregado'
      ? 'bg-gray-200 text-gray-800'
      : 'bg-yellow-100 text-yellow-800';
  return (
    <span className={`inline-block px-3 py-1 text-sm font-semibold rounded ${color}`}>
      {status}
    </span>
  );
};

const OrderTrackingPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showQR, setShowQR] = useState(false);
  const [showNotificationSettings, setShowNotificationSettings] = useState(false);

  // 📊 Definir etapas de progreso
  const getProgressSteps = () => [
    { key: 'Pendiente', label: 'Pedido Recibido', icon: '📋' },
    { key: 'En preparación', label: 'En Preparación', icon: '👨‍🍳' },
    { key: 'Listo', label: 'Listo para Retiro', icon: '✅' },
    { key: 'Pagado', label: 'Pagado', icon: '💳', condition: () => order?.paid },
    { key: 'Entregado', label: 'Entregado', icon: '🎉' }
  ];

  const getStepStatus = (step) => {
    if (step.key === 'Pagado') {
      return order?.paid ? 'completed' : order?.status === 'Listo' ? 'current' : 'pending';
    }
    
    const statusOrder = ['Pendiente', 'En preparación', 'Listo', 'Entregado'];
    const currentIndex = statusOrder.indexOf(order?.status);
    const stepIndex = statusOrder.indexOf(step.key);
    
    if (stepIndex < currentIndex) return 'completed';
    if (stepIndex === currentIndex) return 'current';
    return 'pending';
  };

  const getPaymentStatusMessage = () => {
    if (!order) return '';
    
    if (order.paid) {
      return '✅ Pago confirmado';
    }
    
    if (order.paymentMethod === 'online') {
      return '⏳ Esperando confirmación de transferencia';
    }
    
    if (order.paymentMethod === 'local') {
      return '💰 Pago en efectivo al retirar';
    }
    
    return '⏳ Pendiente de pago';
  };

  useEffect(() => {
    const loadOrder = async () => {
      if (!orderId) {
        setError('Número de pedido no proporcionado');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError('');
        
        // Buscar por orderId directamente usando el endpoint específico
        const response = await fetch(`${process.env.REACT_APP_API_URL}/api/orders/${orderId}`);
        
        if (response.ok) {
          const foundOrder = await response.json();
          setOrder(foundOrder);
        } else {
          setError('Pedido no encontrado. Verifica el número de pedido.');
        }
      } catch (err) {
        console.error('Error cargando pedido:', err);
        setError('Error al cargar el pedido. Intenta nuevamente.');
      } finally {
        setLoading(false);
      }
    };

    loadOrder();
  }, [orderId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-24 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando información del pedido...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 pt-24 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-6xl mb-4">❌</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Pedido no encontrado</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate('/')}
            className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            Volver al inicio
          </button>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 pt-24 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">No se encontró información del pedido</p>
        </div>
      </div>
    );
  }

  const steps = getProgressSteps();
  const totalCLP = order.items?.reduce((acc, item) => acc + (Number(item.price) || 0) * item.quantity, 0) || 0;

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-6">
            <div className="mb-4 sm:mb-0">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
                🥩 Seguimiento de Pedido
              </h1>
              <p className="text-lg text-gray-600">
                #{order.orderNumber || order.id}
              </p>
            </div>
            <div className="text-left sm:text-right">
              <StatusBadge status={order.status} />
              <p className="text-sm text-gray-500 mt-2">
                {new Date(order.createdAt).toLocaleDateString('es-CL', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
          </div>

          {/* Información del cliente */}
          <div className="border-t pt-6">
            <h3 className="font-semibold text-gray-700 mb-4 flex items-center">
              <span className="mr-2">📋</span>
              Información del pedido
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-500 min-w-0 flex-shrink-0">👤 Cliente:</span>
                <span className="ml-2 font-medium truncate">{order.customerName}</span>
              </div>
              <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-500 min-w-0 flex-shrink-0">📞 Teléfono:</span>
                <span className="ml-2 font-medium truncate">{order.customerPhone}</span>
              </div>
              <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-500 min-w-0 flex-shrink-0">🕒 Retiro:</span>
                <span className="ml-2 font-medium truncate">{order.pickupTime}</span>
              </div>
              <div className="flex items-center p-3 bg-red-50 rounded-lg">
                <span className="text-gray-500 min-w-0 flex-shrink-0">💰 Total:</span>
                <span className="ml-2 font-bold text-red-600">${totalCLP.toLocaleString('es-CL')}</span>
              </div>
            </div>
            {order.note && (
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <span className="text-gray-500 font-medium">📝 Nota:</span>
                <span className="ml-2 text-gray-700">{order.note}</span>
              </div>
            )}
          </div>
        </div>

        {/* Progress Steps */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
            <span className="mr-2">📊</span>
            Estado del pedido
          </h2>
          
          <div className="space-y-4">
            {steps.map((step, index) => {
              // Skip payment step if condition is not met
              if (step.condition && !step.condition()) return null;
              
              const status = getStepStatus(step);
              const isCompleted = status === 'completed';
              const isCurrent = status === 'current';
              
              return (
                <div key={step.key} className="flex items-center">
                  <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-lg ${
                    isCompleted 
                      ? 'bg-green-500 text-white' 
                      : isCurrent 
                        ? 'bg-blue-500 text-white' 
                        : 'bg-gray-200 text-gray-500'
                  }`}>
                    {isCompleted ? '✓' : step.icon}
                  </div>
                  
                  <div className="ml-4 flex-1">
                    <h3 className={`font-medium ${
                      isCompleted || isCurrent ? 'text-gray-900' : 'text-gray-500'
                    }`}>
                      {step.label}
                    </h3>
                    
                    {step.key === 'Pagado' && (
                      <p className="text-sm text-gray-600 mt-1">
                        {getPaymentStatusMessage()}
                      </p>
                    )}
                    
                    {isCurrent && step.key !== 'Pagado' && (
                      <p className="text-sm text-blue-600 mt-1">
                        Estado actual
                      </p>
                    )}
                  </div>
                  
                  {index < steps.length - 1 && (
                    <div className={`absolute left-5 mt-10 w-0.5 h-8 ${
                      isCompleted ? 'bg-green-500' : 'bg-gray-200'
                    }`} style={{ marginLeft: '20px' }} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Items del pedido */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
            <span className="mr-2">🛒</span>
            Detalles del pedido
          </h2>
          
          <div className="space-y-3">
            {order.items?.map((item, index) => (
              <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                <div>
                  <h3 className="font-medium text-gray-800">{item.name}</h3>
                  <p className="text-sm text-gray-600">
                    {item.quantity} {item.unit} × ${Number(item.price).toLocaleString('es-CL')}
                  </p>
                </div>
                <div className="font-medium text-gray-800">
                  ${(Number(item.price) * item.quantity).toLocaleString('es-CL')}
                </div>
              </div>
            ))}
          </div>
          
          <div className="border-t pt-4 mt-4">
            <div className="flex justify-between items-center text-lg font-bold">
              <span>Total:</span>
              <span>${totalCLP.toLocaleString('es-CL')}</span>
            </div>
          </div>
        </div>

        {/* Payment Status */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
            <span className="mr-2">💳</span>
            Estado del pago
          </h2>
          <div className="flex items-center">
            <div className={`w-4 h-4 rounded-full mr-3 ${
              order.paid ? 'bg-green-500' : 'bg-yellow-500'
            }`}></div>
            <span className="text-gray-700">{getPaymentStatusMessage()}</span>
          </div>
        </div>

        {/* QR Code */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-800 flex items-center">
              <span className="mr-2">📱</span>
              Código QR
            </h2>
            <button
              onClick={() => setShowQR(!showQR)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              {showQR ? 'Ocultar QR' : 'Mostrar QR'}
            </button>
          </div>
          
          {showQR && (
            <div className="text-center">
              <OrderQRCode orderId={order.id || order._id} />
              <p className="text-sm text-gray-600 mt-2">
                Presenta este código QR al retirar tu pedido
              </p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="text-center space-y-4">
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => setShowNotificationSettings(true)}
              className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
            >
              🔔 Activar Notificaciones
            </button>
            <button
              onClick={() => navigate('/')}
              className="bg-red-600 text-white px-6 py-3 rounded-xl hover:bg-red-700 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
            >
              🏠 Volver al inicio
            </button>
          </div>
          <p className="text-sm text-gray-500">
            💡 Activa las notificaciones para recibir actualizaciones de tu pedido en tiempo real
          </p>
        </div>
      </div>

      {/* Modal de configuración de notificaciones */}
      {showNotificationSettings && (
        <NotificationSettings
          userEmail={order?.customerEmail}
          orderId={order?.orderNumber || order?.id}
          onClose={() => setShowNotificationSettings(false)}
        />
      )}
    </div>
  );
};

export default OrderTrackingPage;
