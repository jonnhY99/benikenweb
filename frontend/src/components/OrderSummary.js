// src/components/OrderSummary.js
import React from 'react';

const OrderSummary = ({ cartItems, total }) => {
  const totalCalculado = total ?? cartItems.reduce((acc, item) => {
    const precioNumerico = Number(item.price) || 0;
    return acc + precioNumerico * item.quantity;
  }, 0);

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Resumen del Pedido</h2>
      <div className="space-y-3 mb-6">
        {cartItems.map((item) => {
          const precioNumerico = Number(item.price) || 0;
          const subtotal = precioNumerico * item.quantity;

          return (
            <div key={item.productId} className="flex justify-between text-gray-700">
              <span>
                {item.name} ({item.quantity} {item.unit})
              </span>
              <span>
                ${subtotal.toLocaleString('es-CL')}
              </span>
            </div>
          );
        })}
      </div>
      <div className="flex justify-between items-center border-t border-gray-200 pt-4">
        <span className="text-xl font-bold text-gray-800">Total:</span>
        <span className="text-3xl font-bold text-red-700">
          ${totalCalculado.toLocaleString('es-CL')}
        </span>
      </div>
    </div>
  );
};

export default OrderSummary;
