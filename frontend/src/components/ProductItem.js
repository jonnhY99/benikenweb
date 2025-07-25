import React, { useState } from 'react';

const ProductCard = ({ product, onAddToCart }) => {
  const [quantity, setQuantity] = useState(1);

  const handleQuantityChange = (e) => {
    const value = parseInt(e.target.value, 10);
    if (value > 0 && value <= product.stock) {
      setQuantity(value);
    } else if (value > product.stock) {
      setQuantity(product.stock);
    } else {
      setQuantity(1);
    }
  };

  const handleAddToCart = () => {
    onAddToCart(product, quantity);
    setQuantity(1); // Reset quantity after adding to cart
  };

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden transform transition-transform hover:scale-105">
      <img src={product.image} alt={product.name} className="w-full h-48 object-cover" />
      <div className="p-4">
        <h3 className="text-xl font-semibold text-gray-800 mb-2">{product.name}</h3>
        <p className="text-gray-600 text-sm mb-3">{product.description}</p>
        <div className="flex justify-between items-center mb-4">
          <span className="text-2xl font-bold text-red-700">${product.price.toFixed(2)}/{product.unit}</span>
          <span className="text-sm text-gray-500">Stock: {product.stock}</span>
        </div>
        <div className="flex items-center space-x-2 mb-4">
          <label htmlFor={`quantity-${product.id}`} className="sr-only">Cantidad</label>
          <input
            type="number"
            id={`quantity-${product.id}`}
            value={quantity}
            onChange={handleQuantityChange}
            min="1"
            max={product.stock}
            className="w-24 px-3 py-2 border border-gray-300 rounded-lg text-center focus:outline-none focus:ring-2 focus:ring-red-500"
          />
          <span className="text-gray-600">{product.unit}</span>
        </div>
        <button
          onClick={handleAddToCart}
          disabled={product.stock === 0}
          className="w-full bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {product.stock > 0 ? 'Agregar al Carrito' : 'Agotado'}
        </button>
      </div>
    </div>
  );
};

export default ProductCard;