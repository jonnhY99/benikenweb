import React, { useState, useContext } from 'react';
import ProductCard from './ProductItem.js';
import ProductForm from './ProductForm.js';
import { AuthContext } from '../context/AuthContext';

const ProductList = ({ products, onAddToCart, onProductsUpdate }) => {
  const { user } = useContext(AuthContext);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [loading, setLoading] = useState(false);

  const isAdmin = user && user.role === 'admin';

  const handleAddProduct = () => {
    setEditingProduct(null);
    setShowForm(true);
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setShowForm(true);
  };

  const handleSaveProduct = async (productData) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      const url = editingProduct 
        ? `${process.env.REACT_APP_API_URL}/api/products/${editingProduct.id}`
        : `${process.env.REACT_APP_API_URL}/api/products`;
      
      const method = editingProduct ? 'PATCH' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(productData)
      });

      if (response.ok) {
        setShowForm(false);
        setEditingProduct(null);
        // Refresh products list
        if (onProductsUpdate) {
          onProductsUpdate();
        }
      } else {
        const error = await response.json();
        alert(error.error || 'Error al guardar el producto');
      }
    } catch (error) {
      console.error('Error saving product:', error);
      alert('Error al guardar el producto');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingProduct(null);
  };

  return (
    <div>
      {/* Admin Controls */}
      {isAdmin && (
        <div className="flex justify-between items-center p-6 bg-gray-50 border-b">
          <h2 className="text-xl font-semibold text-gray-800">Gestión de Productos</h2>
          <button
            onClick={handleAddProduct}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
          >
            <span>+</span>
            Agregar Producto
          </button>
        </div>
      )}

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
        {products.map((product) => (
          <ProductCard 
            key={product.id} 
            product={product} 
            onAddToCart={onAddToCart}
            onEditProduct={isAdmin ? handleEditProduct : null}
          />
        ))}
      </div>

      {/* Product Form Modal */}
      {showForm && (
        <ProductForm
          product={editingProduct}
          onSave={handleSaveProduct}
          onCancel={handleCancel}
          isEditing={!!editingProduct}
        />
      )}
    </div>
  );
};

export default ProductList;