import { Shield, Heart, Car, Award } from 'lucide-react';

const WhyChooseUs = () => {
  const reasons = [
    {
      icon: Heart,
      title: 'Carnes Siempre Frescas',
      description: 'Recibimos productos diariamente para garantizar la máxima frescura en cada corte que ofrecemos.'
    },
    {
      icon: Shield,
      title: 'Calidad Garantizada',
      description: 'Seleccionamos cuidadosamente cada corte, asegurando que cumpla con nuestros estándares de calidad.'
    },
    {
      icon: Award,
      title: 'Más de 20 Años de Experiencia',
      description: 'Somos una carnicería de confianza en el Mercado Franklin, con décadas de experiencia.'
    },
    {
      icon: Car,
      title: 'Volveras por otro asado   ',
      description: 'Nuestro equipo experto te ayuda a elegir el corte perfecto para cada ocasión.'
    }
  ];

  return (
    <section id="nosotros" className="py-16 bg-gray-50">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            ¿Por Qué Elegir <span className="text-red-700">Beniken</span>?
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Más de dos décadas brindando carne de primera calidad a las familias de Santiago
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {reasons.map((reason, index) => (
            <div key={index} className="text-center group">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-red-700 to-red-800 rounded-2xl mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <reason.icon className="w-8 h-8 text-white" />
              </div>
              
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                {reason.title}
              </h3>
              
              <p className="text-gray-600 leading-relaxed">
                {reason.description}
              </p>
            </div>
          ))}
        </div>

        {/* Stats Section */}
        <div className="mt-20">
          <div className="bg-gradient-to-r from-red-700 to-red-800 rounded-2xl p-8 md:p-12 text-white">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <div>
                <div className="text-4xl md:text-5xl font-bold mb-2">20+</div>
                <div className="text-white/90">Años de Experiencia</div>
              </div>
              <div>
                <div className="text-4xl md:text-5xl font-bold mb-2">1000+</div>
                <div className="text-white/90">Clientes Satisfechos</div>
              </div>
              <div>
                <div className="text-4xl md:text-5xl font-bold mb-2">100%</div>
                <div className="text-white/90">Carne Fresca</div>
              </div>
            </div>
          </div>
        </div>

        {/* Mission Statement */}
        <div className="mt-16 text-center">
          <div className="max-w-4xl mx-auto">
            <blockquote className="text-2xl md:text-3xl font-medium text-gray-900 leading-relaxed">
              "Nuestra misión es entregar carne de confianza, con atención cercana y ofertas irresistibles, 
              manteniendo la tradición familiar que nos caracteriza desde hace más de 20 años."
            </blockquote>
            <footer className="mt-6 text-gray-600">
              — Familia Beniken
            </footer>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUs;