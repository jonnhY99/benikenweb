import React from 'react';

const GallerySection = () => {
  const galleryItems = [
    {
      id: 1,
      title: "Menu de Productos",
      description: "Visualización de los productos disponibles en la plataforma",
      image: "/image/menu_productos.png"
    },
    {
      id: 2,
      title: "Rebajas para clientes frecuentes",
      description: "En tu tercera compra lleva un 5% de descuento en el total de tu compra",
      image: "/image/descuento.png"
    },
    {
      id: 3,
      title: "Socios Mayoristas",
      description: "Se parte de nuestra red de socios mayoristas y accede a precios exclusivos",
      image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80"
    }
  ];

  return (
    <div className="bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="lg:text-center">
          <h2 className="text-base text-blue-600 font-semibold tracking-wide uppercase">Galería</h2>
          <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
            Nuestra plataforma en acción
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {galleryItems.map((item) => (
            <div key={item.id} className="bg-white overflow-hidden shadow rounded-lg">
              <img className="w-full h-48 object-cover" src={item.image} alt={item.title} />
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg font-medium text-gray-900">{item.title}</h3>
                <p className="mt-1 text-sm text-gray-500">{item.description}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 bg-white shadow overflow-hidden rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium text-gray-900">Tabla de Rendimiento</h3>
            <div className="mt-4 overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Métrica</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Antes</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Después</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mejora</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Rotación de Inventario</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">2.1x</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">3.8x</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 font-semibold">+81%</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Existencias Muertas</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">23%</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">8%</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 font-semibold">-65%</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Precisión de Pronóstico</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">62%</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">94%</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 font-semibold">+52%</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GallerySection;