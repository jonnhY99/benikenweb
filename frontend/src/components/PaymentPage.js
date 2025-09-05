// src/components/PaymentPage.js
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { setPaymentMethod, fetchOrderById } from '../api/orders';

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
        await setPaymentMethod(orderId, 'local');
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
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
          Selecciona tu Método de Pago
        </h2>

        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <p className="text-center text-sm text-gray-600 mb-2">
            Pedido: <span className="font-semibold">{orderId}</span>
          </p>
          <p className="text-center text-lg text-gray-700">
            Total a pagar:{' '}
            <span className="font-bold text-red-700 text-xl">
              ${Math.round(order.totalCLP).toLocaleString('es-CL')}
            </span>
          </p>
        </div>

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
              <span className="font-medium">Pagar en el local</span>
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
              <span className="font-medium">Pagar online</span>
              <p className="text-sm text-gray-500">Transferencia bancaria</p>
            </div>
          </label>
        </div>

        <button
          onClick={handleConfirmPayment}
          disabled={processing}
          className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {processing ? 'Procesando...' : 'Confirmar y Continuar'}
        </button>
      </div>
    </div>
  );
};

export default PaymentPage;
