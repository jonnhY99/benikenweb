import React, { useEffect, useMemo, useState } from 'react';
import { getSocket } from '../utils/socket';
import { fetchOrderById } from '../api/orders';
import { useNavigate } from 'react-router-dom';

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

export default function OrderStatusPage({ orderId: propOrderId, onGoHome }) {
  const navigate = useNavigate();

  const orderId = useMemo(() => {
    return propOrderId || localStorage.getItem('trackingOrderId') || '';
  }, [propOrderId]);

  const [order, setOrder] = useState(null);
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);
  const [seconds, setSeconds] = useState(15); // ⏳ contador para refrescar

  const load = async () => {
    if (!orderId) {
      setErr('No se encontró el identificador del pedido.');
      return;
    }
    setLoading(true);
    setErr('');
    try {
      const data = await fetchOrderById(orderId);
      setOrder(data);
    } catch (e) {
      setErr(e.message || 'No se pudo cargar el pedido.');
    } finally {
      setLoading(false);
    }
  };

  // cargar al inicio
  useEffect(() => {
    load();
  }, [orderId]);

  // escuchar actualizaciones por socket
  useEffect(() => {
    const s = getSocket();
    if (!s) return;
    const onUpdated = (updated) => {
      if (updated?.id === orderId || updated?._id === orderId) {
        setOrder(updated);
      }
    };
    s.on('orders:updated', onUpdated);
    return () => {
      s.off('orders:updated', onUpdated);
    };
  }, [orderId]);

  // ✅ Guardar el trackingOrderId mientras no esté entregado
  useEffect(() => {
    if (order?.id && order.status !== 'Entregado') {
      localStorage.setItem('trackingOrderId', order.id);
    } else if (order?.status === 'Entregado') {
      localStorage.removeItem('trackingOrderId');
    }
  }, [order?.id, order?.status]);

  // contador de actualización automática
  useEffect(() => {
    if (!order || order.status === 'Entregado') return;
    const timer = setInterval(() => {
      setSeconds((s) => {
        if (s <= 1) {
          load();
          return 15; // reiniciar contador
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [order]);

  const prettyMsg = useMemo(() => {
    const st = order?.status || 'Pendiente';
    if (st === 'Listo') return '¡Tu pedido está listo para retiro!';
    if (st === 'Entregado') return 'Pedido entregado. ¡Gracias por tu compra!';
    return 'Tu pedido está en preparación, la carnicería está ajustando los montos según el peso real, esto puede variar entre más o menos gramos.';
  }, [order?.status]);

  const totalCLP = useMemo(() => {
    if (!order?.items?.length) return 0;
    return order.items.reduce(
      (acc, it) => acc + (Number(it.price) || 0) * it.quantity,
      0
    );
  }, [order?.items]);

  return (
    <div className="max-w-3xl mx-auto bg-white rounded-xl shadow p-6">
      <h2 className="text-3xl font-bold mb-4 text-center">Seguimiento de Pedido</h2>

      {!orderId && (
        <p className="text-center text-red-600 mb-4">
          No se encontró el identificador del pedido.
        </p>
      )}

      {err && <div className="bg-red-50 text-red-700 p-3 rounded mb-4">{err}</div>}

      {loading && <p className="text-center">Cargando…</p>}

      {order && (
        <>
          {/* Estado de pago */}
          <div className="mb-4">
            {order.paid ? (
              <div className="bg-green-100 text-green-800 p-3 rounded mb-4 text-center font-semibold">
                ✅ Pago confirmado el{' '}
                {order.paymentDate
                  ? new Date(order.paymentDate).toLocaleString()
                  : 'fecha desconocida'}
              </div>
            ) : (
              <div className="bg-yellow-100 text-yellow-800 p-3 rounded mb-4 text-center font-semibold">
                ⚠️ Pago pendiente
              </div>
            )}
          </div>

          {/* Encabezado */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div>
              <div className="text-gray-600 text-sm">N° de pedido</div>
              <div className="text-xl font-semibold">{order.id}</div>
            </div>
            <div>
              <div className="text-gray-600 text-sm">Hora de retiro</div>
              <div className="text-xl font-semibold">
                {order.pickupTime || '-'}
              </div>
            </div>
            <div>
              <StatusBadge status={order.status} />
            </div>
          </div>

          {/* Datos del cliente */}
          <div className="bg-gray-50 rounded p-4 mb-4">
            <h3 className="font-semibold mb-2">Datos del Cliente</h3>
            <p><strong>Nombre:</strong> {order.customerName || '-'}</p>
            <p><strong>Teléfono:</strong> {order.customerPhone || '-'}</p>
            <p><strong>Correo:</strong> {order.customerEmail || '-'}</p>
            <p><strong>Nota:</strong> {order.note?.trim() || '-'}</p>
          </div>

          {/* Estado */}
          <div className="bg-gray-50 rounded p-4 mb-4 text-center">
            <p className="text-lg mb-2">{prettyMsg}</p>
            {order.status !== 'Listo' && order.status !== 'Entregado' && (
              <p className="text-sm text-gray-600">
                🔄 Actualizando en {seconds}s…
              </p>
            )}
          </div>

          {/* Detalle del pedido */}
          <div className="mb-4">
            <h3 className="font-semibold mb-2">Detalle del Pedido</h3>
            <ul className="list-disc list-inside text-gray-700 space-y-1">
              {order.items?.map((it, idx) => (
                <li key={idx}>
                  {it.name} — {it.quantity} {it.unit || 'kg'} ($
                  {(Number(it.price) || 0).toLocaleString('es-CL')})
                </li>
              ))}
            </ul>
            <div className="mt-3 border-t pt-3 flex justify-between font-bold text-lg text-red-700">
              <span>Total:</span>
              <span>${totalCLP.toLocaleString('es-CL')}</span>
            </div>
          </div>

          {/* Botones */}
          <div className="flex justify-center gap-3">
            {order.status === 'Listo' && !order.paid && (
              <button
                className="px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700"
                onClick={() => navigate(`/payment/${order.id}`)}
              >
                Ir a Pagar
              </button>
            )}
            <button
              className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
              onClick={load}
            >
              Actualizar ahora
            </button>
            <button
              className="px-4 py-2 rounded bg-red-700 text-white hover:bg-red-800"
              onClick={() =>
                onGoHome ? onGoHome() : (window.location.href = '/')
              }
            >
              Ir al inicio
            </button>
          </div>
        </>
      )}
    </div>
  );
}
