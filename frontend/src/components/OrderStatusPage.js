import React, { useEffect, useMemo, useState } from 'react';
import { getSocket } from '../utils/socket';
import { fetchOrderById } from '../api/orders';
import { useNavigate } from 'react-router-dom';
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

export default function OrderStatusPage({ orderId: propOrderId, onGoHome }) {
  const navigate = useNavigate();

  const orderId = useMemo(() => {
    return propOrderId || localStorage.getItem('trackingOrderId') || '';
  }, [propOrderId]);

  const [order, setOrder] = useState(null);
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);
  const [seconds, setSeconds] = useState(15); // ⏳ contador para refrescar
  const [showQR, setShowQR] = useState(false);

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

  // escuchar actualizaciones por socket (incluyendo cambios de precio del carnicero)
  useEffect(() => {
    const s = getSocket();
    if (!s) return;
    
    const onUpdated = (updated) => {
      if (updated?.id === orderId || updated?._id === orderId) {
        // Actualizar inmediatamente cuando el carnicero modifica pesos/precios
        setOrder(updated);
        // Reiniciar contador si hay cambios
        setSeconds(15);
      }
    };
    
    // Escuchar eventos específicos del carnicero
    const onButcherUpdate = (data) => {
      if (data?.orderId === orderId) {
        // Actualizar orden con nuevos precios/pesos
        setOrder(prev => ({
          ...prev,
          items: data.items || prev.items,
          totalCLP: data.newTotal || prev.totalCLP,
          status: data.status || prev.status
        }));
        setSeconds(15); // Reiniciar contador
      }
    };
    
    s.on('orders:updated', onUpdated);
    s.on('butcher:order:updated', onButcherUpdate);
    
    return () => {
      s.off('orders:updated', onUpdated);
      s.off('butcher:order:updated', onButcherUpdate);
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
    if (st === 'Listo') {
      if (order?.paid) {
        return '¡Tu pedido está listo para retiro! Usa el código QR para retirar tu pedido.';
      } else if (order?.paymentMethod === 'local') {
        return '¡Tu pedido está listo para retiro! Recuerda llevar el dinero para pagar en la tienda.';
      } else if (order?.receiptData?.validationStatus === 'pending') {
        return 'Tu pedido está listo, pero estamos validando tu comprobante de transferencia.';
      } else if (order?.receiptData?.validationStatus === 'rejected') {
        return 'Tu pedido está listo, pero necesitas subir un nuevo comprobante de transferencia.';
      }
      return '¡Tu pedido está listo! Completa el pago para poder retirarlo.';
    }
    if (st === 'Entregado') return 'Pedido entregado. ¡Gracias por tu compra!';
    
    // Durante la preparación NO mostrar mensajes de validación
    // Los mensajes de validación solo aparecen cuando el pedido está 'Listo'
    
    // Mensaje por defecto durante preparación
    return 'Tu pedido está en preparación, la carnicería está ajustando los montos según el peso real, esto puede variar entre más o menos gramos.';
  }, [order?.status, order?.paymentMethod, order?.paid, order?.receiptData]);

  const totalCLP = useMemo(() => {
    if (!order?.items?.length) return 0;
    const total = order.items.reduce(
      (acc, it) => acc + (Number(it.price) || 0) * it.quantity,
      0
    );
    return Math.round(total);
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
                {order.paymentMethod && (
                  <span className="block text-sm mt-1">
                    Método: {order.paymentMethod === 'local' ? 'Pago en tienda' : 'Pago online'}
                  </span>
                )}
              </div>
            ) : (order.receiptData && order.receiptData.validationStatus === 'pending' && order.status === 'Listo' && order.receiptData.uploadedAt) ? (
              <div className="bg-blue-100 text-blue-800 p-3 rounded mb-4 text-center font-semibold">
                🔍 Comprobante en validación
                <span className="block text-sm mt-1">
                  📄 Tu comprobante de transferencia está siendo revisado por la carnicería. Te notificaremos cuando sea validado.
                </span>
              </div>
            ) : (order.receiptData && order.receiptData.validationStatus === 'rejected' && order.status === 'Listo' && order.receiptData.uploadedAt) ? (
              <div className="bg-red-100 text-red-800 p-3 rounded mb-4 text-center font-semibold">
                ❌ Transferencia rechazada
                <span className="block text-sm mt-1">
                  {order.receiptData.validationNotes || 'Contacta con la carnicería para más información'}
                </span>
              </div>
            ) : (
              <div className="bg-yellow-100 text-yellow-800 p-3 rounded mb-4 text-center font-semibold">
                ⚠️ Pago pendiente
                {order.paymentMethod === 'local' && (
                  <span className="block text-sm mt-1">
                    💳 Recuerda pagar al momento del retiro en la tienda
                  </span>
                )}
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
                  {it.name} — {Number(it.quantity).toFixed(3)} {it.unit || 'kg'} ($
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
            {/* Mostrar QR cuando esté listo y pagado */}
            {order.status === 'Listo' && order.paid && (
              <button
                className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 flex items-center gap-2"
                onClick={() => setShowQR(true)}
              >
                📱 Ver QR para retiro
              </button>
            )}
            
            {/* Botones de pago cuando está listo pero no pagado */}
            {order.status === 'Listo' && !order.paid && (
              order.paymentMethod === 'local' ? (
                <button
                  className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 flex items-center gap-2"
                  onClick={() => setShowQR(true)}
                >
                  📱 Ver QR para retiro
                </button>
              ) : (order.receiptData && order.receiptData.validationStatus === 'rejected') ? (
                <button
                  className="px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700"
                  onClick={() => navigate(`/payment/${order.id}`)}
                >
                  Subir nuevo comprobante
                </button>
              ) : (
                <button
                  className="px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700"
                  onClick={() => navigate(`/payment/${order.id}`)}
                >
                  Ir a Pagar
                </button>
              )
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
      
      {/* QR Modal */}
      {showQR && order && (
        <OrderQRCode 
          order={order} 
          onClose={() => setShowQR(false)} 
        />
      )}
    </div>
  );
}
