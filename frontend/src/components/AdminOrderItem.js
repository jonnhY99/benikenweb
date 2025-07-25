import React from 'react';

const AdminOrderCard = ({ order, onUpdateStatus }) => {
  const statusColors = {
    'Pendiente': 'bg-yellow-100 text-yellow-800',
    'Completado': 'bg-green-100 text-green-800',
    'Cancelado': 'bg-red-100 text-red-800',
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg mb-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold text-gray-800">Pedido #{order.id}</h3>
        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${statusColors[order.status]}`}>
          {order.status}
        </span>
      </div>
      <p className="text-gray-700 mb-2">Cliente: {order.customerName} ({order.customerPhone})</p>
      <p className="text-gray-700 mb-2">Hora de Recogida: {order.pickupTime}</p>
      <div className="mb-4">
        <h4 className="text-lg font-semibold text-gray-800 mb-2">Artículos:</h4>
        <ul className="list-disc list-inside text-gray-600">
          {order.items.map((item, index) => (
            <li key={index}>{item.name} - {item.quantity} {item.unit} (${item.price.toFixed(2)} c/u)</li>
          ))}
        </ul>
      </div>
      <div className="flex justify-between items-center border-t border-gray-200 pt-4">
        <span className="text-xl font-bold text-gray-800">Total: ${order.total.toFixed(2)}</span>
        <select
          value={order.status}
          onChange={(e) => onUpdateStatus(order.id, e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
        >
          <option value="Pendiente">Pendiente</option>
          <option value="Completado">Completado</option>
          <option value="Cancelado">Cancelado</option>
        </select>
      </div>
    </div>
  );
};

export default AdminOrderCard;