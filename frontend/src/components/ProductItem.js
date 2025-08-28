import React, { useState } from 'react';

const formatCLP = (value) => {
  // 6298 => "$6.298"
  return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(value);
};

const ProductItem = ({ product, onAddToCart }) => {
  const [quantity, setQuantity] = useState(0.5); // Default 0.5 kg
  
  // Calculate estimated price
  const estimatedPrice = quantity * product.price;
  
  const handleQuantityChange = (e) => {
    const value = parseFloat(e.target.value) || 0;
    setQuantity(Math.max(0, value)); // Ensure non-negative
  };

  const handleAdd = () => {
    if (quantity > 0) {
      // Pass product with quantity and estimated price
      onAddToCart(product, quantity, estimatedPrice);
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
      
      {/* Estimated Price Display */}
      <div className="bg-gray-50 p-3 rounded-lg mb-4">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Precio estimado:</span>
          <span className="text-lg font-bold text-green-600">
            {formatCLP(estimatedPrice)}
          </span>
        </div>
        <div className="text-xs text-gray-500 mt-1">
          {quantity} {product.unit} × {formatCLP(product.price)}
        </div>
      </div>

      <div className="flex items-center space-x-3">
        <div className="flex flex-col">
          <label className="text-xs text-gray-600 mb-1">Cantidad ({product.unit})</label>
          <input
            type="number"
            min="0.1"
            step="0.1"
            value={quantity}
            onChange={handleQuantityChange}
            className="w-24 px-3 py-2 border border-gray-300 rounded-lg text-center focus:outline-none focus:ring-2 focus:ring-red-500"
            placeholder="0.5"
          />
        </div>
        <button
          onClick={handleAdd}
          disabled={quantity <= 0}
          className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          Agregar al Carrito
        </button>
      </div>
    </div>
  );
};

export default ProductItem;
