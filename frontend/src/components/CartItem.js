import React from 'react';

const formatCLP = (value) => {
  // value en pesos chilenos como entero: 6298 => "$6.298"
  return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(value);
};

const CartItem = ({ item, onUpdateQuantity, onRemoveItem }) => {
  const handleQuantityChange = (e) => {
    const newQuantity = parseInt(e.target.value, 10);
    if (newQuantity > 0) {
      onUpdateQuantity(item.productId, newQuantity);
    }
  };

  return (
    <div className="flex items-center bg-white p-4 rounded-lg shadow-sm mb-4">
      <img src={item.image} alt={item.name} className="w-20 h-20 object-cover rounded-md mr-4" />
      <div className="flex-grow">
        <h3 className="text-lg font-semibold text-gray-800">{item.name}</h3>
        <p className="text-gray-600 text-sm">
          {formatCLP(item.price)}/{item.unit}
        </p>
        <p className="text-gray-700 font-bold mt-1">
          Subtotal: {formatCLP(item.price * item.quantity)}
        </p>
      </div>
      <div className="flex items-center space-x-2">
        <input
          type="number"
          value={item.quantity}
          onChange={handleQuantityChange}
          min="1"
          className="w-20 px-3 py-2 border border-gray-300 rounded-lg text-center focus:outline-none focus:ring-2 focus:ring-red-500"
        />
        <button
          onClick={() => onRemoveItem(item.productId)}
          className="bg-red-500 text-white p-2 rounded-lg hover:bg-red-600 transition-colors"
        >
          {/* SVG for trash icon */}
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm6 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default CartItem;
