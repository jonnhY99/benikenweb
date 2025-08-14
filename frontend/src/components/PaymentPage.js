// src/components/PaymentPage.js
import React, { useState } from 'react';
import { updateOrderStatus } from '../api/orders';

const PaymentPage = ({ total, orderId, onPaymentComplete }) => {
  const [method, setMethod] = useState('local');
  const [processing, setProcessing] = useState(false);

  const handleConfirmPayment = async () => {
    if (!orderId) {
      alert('No hay un pedido válido para procesar el pago.');
      return;
    }

    setProcessing(true);

    try {
      if (method === 'online') {
        setTimeout(async () => {
          alert('Pago online simulado completado correctamente.');
          await updateOrderStatus(orderId, 'En preparación');
          setProcessing(false);
          if (onPaymentComplete) onPaymentComplete();
        }, 2000);
      } else {
        await updateOrderStatus(orderId, 'En preparación');
        alert('Tu pedido fue registrado. Paga al momento del retiro.');
        setProcessing(false);
        if (onPaymentComplete) onPaymentComplete();
      }
    } catch (error) {
      console.error('Error al actualizar el estado del pedido:', error);
      alert('Ocurrió un error al procesar el pago.');
      setProcessing(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg max-w-lg mx-auto">
      <h2 className="text-2xl font-bold mb-4 text-center text-gray-800">
        Selecciona tu Método de Pago
      </h2>
      <p className="text-center text-lg mb-6 text-gray-600">
        Total a pagar: <span className="font-bold text-red-700">${total.toLocaleString('es-CL')}</span>
      </p>

      <div className="space-y-4">
        <label className="flex items-center gap-2">
          <input
            type="radio"
            name="paymentMethod"
            value="local"
            checked={method === 'local'}
            onChange={() => setMethod('local')}
          />
          <span>Pagar en el local</span>
        </label>

        <label className="flex items-center gap-2">
          <input
            type="radio"
            name="paymentMethod"
            value="online"
            checked={method === 'online'}
            onChange={() => setMethod('online')}
          />
          <span>Pagar online (simulación)</span>
        </label>
      </div>

      <button
        onClick={handleConfirmPayment}
        disabled={processing}
        className="mt-6 w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors font-semibold"
      >
        {processing ? 'Procesando...' : 'Confirmar y Continuar'}
      </button>
    </div>
  );
};

export default PaymentPage;
