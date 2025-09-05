// src/components/OrderQRCode.js
import React from 'react';
import { QRCodeCanvas } from 'qrcode.react';

const OrderQRCode = ({ order, onClose }) => {
  if (!order) return null;

  // Crear datos del QR con información del pedido
  const qrData = JSON.stringify({
    id: order.id,
    customerName: order.customerName,
    customerPhone: order.customerPhone,
    pickupTime: order.pickupTime,
    totalCLP: Math.round(order.totalCLP || 0),
    items: order.items,
    paid: order.paid,
    paymentMethod: order.paymentMethod,
    status: order.status
  });

  const total = Math.round(order.totalCLP || 0);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-800">QR para Retiro</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl"
            >
              ×
            </button>
          </div>

          {/* QR Code */}
          <div className="flex justify-center mb-6">
            <div className="bg-white p-4 rounded-lg border-2 border-gray-200">
              <QRCodeCanvas
                value={qrData}
                size={200}
                level="M"
                includeMargin={true}
              />
            </div>
          </div>

          {/* Order Info */}
          <div className="space-y-3 text-sm">
            <div className="text-center">
              <div className="text-lg font-bold text-red-700">#{order.id}</div>
              <div className="text-gray-600">Presenta este QR al carnicero</div>
            </div>

            <div className="border-t pt-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="font-semibold">Cliente:</span>
                  <div className="text-gray-700">{order.customerName}</div>
                </div>
                <div>
                  <span className="font-semibold">Retiro:</span>
                  <div className="text-gray-700">{order.pickupTime}</div>
                </div>
              </div>
            </div>

            <div className="border-t pt-3">
              <div className="font-semibold mb-2">Productos:</div>
              <ul className="space-y-1 text-gray-700">
                {order.items?.map((item, idx) => (
                  <li key={idx} className="flex justify-between">
                    <span>{item.name} - {Number(item.quantity).toFixed(3)} {item.unit || 'kg'}</span>
                    <span>${(Number(item.price) || 0).toLocaleString('es-CL')}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="border-t pt-3">
              <div className="flex justify-between items-center font-bold text-lg">
                <span>Total a pagar:</span>
                <span className="text-red-700">${total.toLocaleString('es-CL')}</span>
              </div>
            </div>

            <div className="border-t pt-3">
              <div className="flex justify-between items-center">
                <span className="font-semibold">Estado de pago:</span>
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  order.paid 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {order.paid ? 'PAGADO' : 'PENDIENTE'}
                </span>
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <div className="text-sm text-blue-800">
              <div className="font-semibold mb-2">📱 Instrucciones:</div>
              <ol className="list-decimal list-inside space-y-1">
                <li>Muestra este QR al carnicero</li>
                <li>El carnicero escaneará el código</li>
                <li>Paga el monto total indicado</li>
                <li>Retira tu pedido</li>
              </ol>
            </div>
          </div>

          {/* Close button */}
          <div className="mt-6 flex justify-center">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderQRCode;
