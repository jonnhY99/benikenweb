import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';

const ProductsPreview = ({ products = [] }) => {
  // Mostrar solo los primeros 3 productos
  const featuredProducts = products.slice(0, 3);

  return (
    <section id="productos" className="py-16 bg-gray-50">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Nuestros <span className="text-red-700">Productos</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Cortes frescos de vacuno y cerdo seleccionados especialmente para ti
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featuredProducts.map((product) => (
            <div key={product.id} className="bg-white rounded-lg shadow-lg overflow-hidden group hover:shadow-xl transition-shadow duration-300">
              <div className="relative overflow-hidden">
                <img
                  src={product.image || 'https://images.unsplash.com/photo-1588168333986-5078d3ae3976?w=400&h=300&fit=crop'}
                  alt={product.name}
                  className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute top-4 left-4">
                  <span className="bg-red-700 text-white px-3 py-1 rounded-full text-sm font-medium">
                    {product.category || 'Carne'}
                  </span>
                </div>
              </div>
              
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {product.name}
                </h3>
                <p className="text-gray-600 mb-4">
                  {product.description || 'Corte fresco de primera calidad'}
                </p>
                
                <div className="flex items-center justify-between">
                  <div className="text-2xl font-bold text-red-700">
                    ${product.price?.toLocaleString('es-CL') || '0'}
                    <span className="text-sm text-gray-500 font-normal">
                      /{product.unit || 'kg'}
                    </span>
                  </div>
                  
                  <button className="inline-flex items-center px-4 py-2 bg-red-700 text-white font-medium rounded-lg hover:bg-red-800 transition-colors duration-200">
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    Consultar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <Link
            to="/productos"
            className="inline-flex items-center px-8 py-4 bg-red-700 text-white font-bold text-lg rounded-lg hover:bg-red-800 transition-colors duration-200 shadow-lg hover:shadow-xl"
          >
            Ver Todos los Productos
          </Link>
        </div>
      </div>
    </section>
  );
};

export default ProductsPreview;
