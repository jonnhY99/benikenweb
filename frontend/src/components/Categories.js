// import beefImage from '/image/carne de cerdo.png';
// import porkImage from '/image/carne de vacuno.png';

const Categories = () => {
  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Nuestras <span className="text-red-700">Especialidades</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Encuentra los mejores cortes de carne fresca
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Vacuno Category */}
          <div className="bg-white rounded-lg shadow-lg overflow-hidden group">
            <div className="relative h-96">
              <img
                src="image/carne de vacuno.png"
                alt="Cortes de Vacuno"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
              
              <div className="absolute bottom-0 left-0 right-0 p-8">
                <h3 className="text-3xl font-bold text-white mb-2">
                  VACUNO
                </h3>
                <p className="text-white/90 text-lg mb-4">
                  Cortes premium de vacuno fresco, ideal para asados y parrillas
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="bg-red-700/20 text-white px-3 py-1 rounded-full text-sm">
                    Pulpa Deshuesada
                  </span>
                  <span className="bg-red-700/20 text-white px-3 py-1 rounded-full text-sm">
                    Asiento
                  </span>
                  <span className="bg-red-700/20 text-white px-3 py-1 rounded-full text-sm">
                    Posta Negra
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Cerdo Category */}
          <div className="bg-white rounded-lg shadow-lg overflow-hidden group">
            <div className="relative h-96">
              <img
                src="image/carne de cerdo.png"
                alt="Cortes de Cerdo"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
              
              <div className="absolute bottom-0 left-0 right-0 p-8">
                <h3 className="text-3xl font-bold text-white mb-2">
                  CERDO
                </h3>
                <p className="text-white/90 text-lg mb-4">
                  Cortes frescos de cerdo, perfectos para cualquier preparación
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="bg-red-700/20 text-white px-3 py-1 rounded-full text-sm">
                    Chuletas Centro
                  </span>
                  <span className="bg-red-700/20 text-white px-3 py-1 rounded-full text-sm">
                    Lomo
                  </span>
                  <span className="bg-red-700/20 text-white px-3 py-1 rounded-full text-sm">
                    Costillar
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quality Promise */}
        <div className="mt-16 text-center">
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Garantía de Frescura
            </h3>
            <p className="text-gray-600 text-lg max-w-3xl mx-auto">
              Todos nuestros cortes son seleccionados diariamente y mantenidos en óptimas condiciones 
              de refrigeración para garantizar su frescura y calidad.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Categories;