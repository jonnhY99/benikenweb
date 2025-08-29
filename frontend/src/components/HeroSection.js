import React from 'react';
import { Link } from 'react-router-dom';
import { Eye, MessageCircle, Check } from 'lucide-react';

const HeroSection = () => {
  return (
    <section id="inicio" className="relative min-h-screen flex items-center overflow-hidden -mt-24">
      {/* Background Video */}
      <div className="absolute inset-0 z-0">
        <iframe
          src="https://player.cloudinary.com/embed/?cloud_name=dyeotzjo8&public_id=kling_20250828_Image_to_Video__3129_0_kqksco&profile=carne2"
          width="640"
          height="360"
          style={{ 
            height: 'auto',
            width: '100%',
            aspectRatio: '640 / 360',
            border: 'none',
            pointerEvents: 'none'
          }}
          allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
          allowFullScreen
          frameBorder="0"
          title="Carnicería Beniken - Video promocional"
        />
        {/* Overlay to prevent interactions */}
        <div 
          className="absolute inset-0 z-10"
          style={{
            pointerEvents: 'none',
            userSelect: 'none'
          }}
          onContextMenu={(e) => e.preventDefault()}
          onDoubleClick={(e) => e.preventDefault()}
          onClick={(e) => e.preventDefault()}
        />
      </div>
      
      {/* Logo */}
      <div className="absolute top-20 left-1/2 transform translate-x-2 md:top-24 md:translate-x-4 lg:top-28 lg:translate-x-8 xl:translate-x-12 z-20">
        <img
          src="image/logo_listo.png"
          alt="Carnes Beniken Logo"
          className="w-56 h-56 md:w-72 md:h-72 lg:w-96 lg:h-96 xl:w-[28rem] xl:h-[28rem] object-contain drop-shadow-2xl"
        />
      </div>

      {/* Content */}
      <div className="w-full px-6 md:px-12 lg:px-16 xl:px-20 relative z-10 pt-16">
        <div className="max-w-4xl">
          <h1 className="text-5xl md:text-7xl font-black text-white mb-6 leading-tight tracking-tight" style={{
            textShadow: '4px 4px 8px rgba(0, 0, 0, 0.8), 2px 2px 4px rgba(0, 0, 0, 0.9)',
            fontFamily: 'system-ui, -apple-system, "Segoe UI", "Roboto", "Ubuntu", "Cantarell", sans-serif'
          }}>
            ¡Carne Fresca y de{' '}
            <span className="text-yellow-400 font-black" style={{
              textShadow: '3px 3px 6px rgba(0, 0, 0, 0.9), 1px 1px 3px rgba(184, 134, 11, 0.5)'
            }}>Calidad</span> en Franklin!
          </h1>
          
          <p className="text-xl md:text-2xl text-white mb-8 max-w-2xl font-semibold leading-relaxed" style={{
            textShadow: '2px 2px 4px rgba(0, 0, 0, 0.8)',
            fontFamily: 'system-ui, -apple-system, "Segoe UI", "Roboto", "Ubuntu", "Cantarell", sans-serif'
          }}>
            Vacuno y cerdo de <span className="text-yellow-300 font-bold">primera calidad</span> al mejor precio. <br/>
            <span className="text-red-200 font-bold text-lg md:text-xl">Más de 20 años de experiencia</span> en el Mercado Franklin.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 mb-12">
            <Link
              to="/productos"
              className="inline-flex items-center justify-center px-8 py-4 bg-white text-red-700 font-bold text-lg rounded-lg hover:bg-gray-100 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:-translate-y-1"
            >
              <Eye className="w-5 h-5 mr-2" />
              Menú de Productos
            </Link>
            
            <a
              href="https://wa.me/56912345678"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center px-8 py-4 bg-green-600 text-white font-bold text-lg rounded-lg hover:bg-green-700 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:-translate-y-1"
            >
              <MessageCircle className="w-5 h-5 mr-2" />
              Contactar por WhatsApp
            </a>
          </div>

          {/* Quality Indicators */}
          <div className="flex flex-wrap gap-6 text-white">
            <div className="flex items-center gap-3 bg-black/30 px-4 py-2 rounded-full backdrop-blur-sm">
              <div className="w-3 h-3 bg-yellow-400 rounded-full shadow-lg"></div>
              <span className="font-bold text-sm md:text-base" style={{
                textShadow: '1px 1px 2px rgba(0, 0, 0, 0.8)'
              }}>SIEMPRE FRESCO</span>
            </div>
            <div className="flex items-center gap-3 bg-black/30 px-4 py-2 rounded-full backdrop-blur-sm">
              <div className="w-3 h-3 bg-yellow-400 rounded-full shadow-lg"></div>
              <span className="font-bold text-sm md:text-base" style={{
                textShadow: '1px 1px 2px rgba(0, 0, 0, 0.8)'
              }}>PRIMERA CALIDAD</span>
            </div>
            <div className="flex items-center gap-3 bg-black/30 px-4 py-2 rounded-full backdrop-blur-sm">
              <div className="w-3 h-3 bg-yellow-400 rounded-full shadow-lg"></div>
              <span className="font-bold text-sm md:text-base" style={{
                textShadow: '1px 1px 2px rgba(0, 0, 0, 0.8)'
              }}>PRECIOS JUSTOS</span>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10">
        <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-white/70 rounded-full mt-2 animate-bounce"></div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
