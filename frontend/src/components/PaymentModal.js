// src/components/PaymentModal.js
import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { setPaymentMethod, fetchOrderById } from '../api/orders';

const PaymentModal = ({ isOpen, onClose, orderId, onPaymentComplete }) => {
  const [order, setOrder] = useState(null);
  const [method, setMethod] = useState('local');
  const [processing, setProcessing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadOrder = async () => {
      if (!orderId || !isOpen) return;
      
      try {
        setLoading(true);
        const data = await fetchOrderById(orderId);
        setOrder(data);
      } catch (err) {
        console.error('Error cargando pedido:', err);
      } finally {
        setLoading(false);
      }
    };
    
    loadOrder();
  }, [orderId, isOpen]);

  const handleConfirmPayment = async () => {
    if (!orderId) {
      alert('No hay un pedido válido para procesar el pago.');
      return;
    }

    setProcessing(true);

    try {
      if (method === 'online') {
        // Guardamos el orderId en localStorage para usarlo en payweb
        localStorage.setItem('trackingOrderId', orderId);
        // Cerramos el modal y redirigimos
        onClose();
        window.location.href = '/payweb';
      } else {
        await setPaymentMethod(orderId, 'local');
        alert('Tu pedido fue registrado. Paga al momento del retiro.');
        if (onPaymentComplete) onPaymentComplete();
        onClose();
      }
    } catch (error) {
      console.error('Error al procesar el pago:', error);
      alert('Ocurrió un error al procesar el pago.');
    } finally {
      setProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-800">
            Método de Pago
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Cargando información del pedido...</p>
            </div>
          ) : order ? (
            <>
              {/* Order Summary */}
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <p className="text-center text-sm text-gray-600 mb-2">
                  Pedido: <span className="font-semibold">#{order.orderNumber || orderId}</span>
                </p>
                <p className="text-center text-lg text-gray-700">
                  Total a pagar:{' '}
                  <span className="font-bold text-red-700 text-xl">
                    ${Math.round(order.totalCLP || 0).toLocaleString('es-CL')}
                  </span>
                </p>
              </div>

              {/* Payment Methods */}
              <div className="space-y-4 mb-6">
                <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="local"
                    checked={method === 'local'}
                    onChange={() => setMethod('local')}
                    className="w-4 h-4"
                  />
                  <div>
                    <span className="font-medium">💰 Pagar en el local</span>
                    <p className="text-sm text-gray-500">Paga al momento del retiro</p>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="online"
                    checked={method === 'online'}
                    onChange={() => setMethod('online')}
                    className="w-4 h-4"
                  />
                  <div>
                    <span className="font-medium">🏦 Pagar online</span>
                    <p className="text-sm text-gray-500">Transferencia bancaria</p>
                  </div>
                </label>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 bg-gray-500 text-white py-3 rounded-lg hover:bg-gray-600 transition-colors font-medium"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleConfirmPayment}
                  disabled={processing}
                  className="flex-1 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {processing ? 'Procesando...' : 'Confirmar Pago'}
                </button>
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <p className="text-red-600">Error al cargar la información del pedido</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;
