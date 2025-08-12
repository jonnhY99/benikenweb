import React, { useState } from 'react';

const formatCLP = (value) => {
  // 6298 => "$6.298"
  return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(value);
};

const ProductItem = ({ product, onAddToCart }) => {
  const [quantity, setQuantity] = useState(1);

  const handleAdd = () => {
    if (quantity > 0) {
      onAddToCart(product, quantity);
    }
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <img
        src={product.image}
        alt={product.name}
        className="w-full h-48 object-cover rounded-md mb-4"
        loading="lazy"
        onError={(e) => { e.currentTarget.src = '/images/placeholder.png'; }}
      />

      <h3 className="text-xl font-semibold mb-1">{product.name}</h3>
      <p className="text-gray-600 text-sm mb-2">{product.description}</p>

      <div className="flex items-center justify-between mb-3">
        <span className="text-red-600 font-bold text-xl">
          {formatCLP(product.price)}/{product.unit}
        </span>
        <span className="text-gray-500 text-sm">Stock: {product.stock}</span>
      </div>

      <div className="flex items-center space-x-3">
        <input
          type="number"
          min="1"
          value={quantity}
          onChange={(e) => setQuantity(parseInt(e.target.value || '1', 10))}
          className="w-20 px-3 py-2 border border-gray-300 rounded-lg text-center focus:outline-none focus:ring-2 focus:ring-red-500"
        />
        <button
          onClick={handleAdd}
          className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition-colors"
        >
          Agregar al Carrito
        </button>
      </div>
    </div>
  );
};

export default ProductItem;
