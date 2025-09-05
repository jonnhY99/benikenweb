// src/components/AdminOrderCard.js
import React from 'react';

const AdminOrderCard = ({ order, onUpdateStatus }) => {
  const statusColors = {
    'Pendiente': 'bg-yellow-100 text-yellow-800',
    'Listo': 'bg-green-100 text-green-800',
    'Entregado': 'bg-gray-200 text-gray-800',
    'Cancelado': 'bg-red-100 text-red-800',
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg mb-4">
      {/* Encabezado */}
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold text-gray-800">Pedido #{order.id}</h3>
        <span
          className={`px-3 py-1 rounded-full text-sm font-semibold ${statusColors[order.status] || ''}`}
        >
          {order.status}
        </span>
      </div>

      {/* Datos del cliente */}
      <div className="mb-4">
        <p className="text-gray-700">
          <strong>Cliente:</strong> {order.customerName || '-'}
        </p>
        <p className="text-gray-700">
          <strong>Teléfono:</strong> {order.customerPhone || '-'}
        </p>
        <p className="text-gray-700">
          <strong>Correo:</strong> {order.customerEmail || '-'}
        </p>
        {order.note && (
          <p className="text-gray-700">
            <strong>Nota:</strong> {order.note}
          </p>
        )}
        <p className="text-gray-700">
          <strong>Hora de Recogida:</strong> {order.pickupTime || '-'}
        </p>
      </div>

      {/* Lista de artículos */}
      <div className="mb-4">
        <h4 className="text-lg font-semibold text-gray-800 mb-2">Artículos:</h4>
        <ul className="list-disc list-inside text-gray-600">
          {order.items?.map((item, index) => (
            <li key={index}>
              {item.name} - {item.quantity} {item.unit} (${Number(item.price).toLocaleString('es-CL')} c/u)
            </li>
          ))}
        </ul>
      </div>

      {/* Total y cambio de estado */}
      <div className="flex justify-between items-center border-t border-gray-200 pt-4">
        <span className="text-xl font-bold text-gray-800">
          Total: ${Number(order.totalCLP || 0).toLocaleString('es-CL')}
        </span>
        <select
          value={order.status}
          onChange={(e) => onUpdateStatus(order.id, e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
        >
          <option value="Pendiente">Pendiente</option>
          <option value="Listo">Listo</option>
          <option value="Entregado">Entregado</option>
          <option value="Cancelado">Cancelado</option>
        </select>
      </div>
    </div>
  );
};

export default AdminOrderCard;
