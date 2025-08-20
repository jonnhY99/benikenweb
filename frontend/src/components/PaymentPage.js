// src/components/PaymentPage.js
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { updateOrderStatus, fetchOrderById } from '../api/orders';

const PaymentPage = ({ onPaymentComplete }) => {
  const { id } = useParams(); // 👈 id del pedido desde la URL
  const orderId = id;
  const [order, setOrder] = useState(null);
  const [method, setMethod] = useState('local');
  const [processing, setProcessing] = useState(false);
  const navigate = useNavigate();

  // 🔹 Cargar datos del pedido para mostrar total actualizado
  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchOrderById(orderId);
        setOrder(data);
      } catch (err) {
        console.error('Error cargando pedido:', err);
      }
    };
    if (orderId) load();
  }, [orderId]);

  const handleConfirmPayment = async () => {
    if (!orderId) {
      alert('No hay un pedido válido para procesar el pago.');
      return;
    }

    setProcessing(true);

    try {
      if (method === 'online') {
        // ✅ Guardamos el orderId en localStorage para usarlo en payweb
        localStorage.setItem('trackingOrderId', orderId);
        navigate('/payweb');
      } else {
        await updateOrderStatus(orderId, 'En preparación');
        alert('Tu pedido fue registrado. Paga al momento del retiro.');
        setProcessing(false);
        if (onPaymentComplete) onPaymentComplete();
        navigate('/order-status'); // 👈 lo llevamos a seguimiento
      }
    } catch (error) {
      console.error('Error al procesar el pago:', error);
      alert('Ocurrió un error al procesar el pago.');
      setProcessing(false);
    }
  };

  if (!order) {
    return <p className="text-center text-gray-600 mt-6">Cargando pedido...</p>;
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg max-w-lg mx-auto">
      <h2 className="text-2xl font-bold mb-4 text-center text-gray-800">
        Selecciona tu Método de Pago
      </h2>

      <p className="text-center text-lg mb-6 text-gray-600">
        Total a pagar:{' '}
        <span className="font-bold text-red-700">
          ${order.totalCLP.toLocaleString('es-CL')}
        </span>
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
          <span>Pagar online</span>
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
