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
          className="w-full h-full object-cover"
          style={{ 
            minHeight: '100vh',
            border: 'none',
            pointerEvents: 'none'
          }}
          allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
          allowFullScreen
          frameBorder="0"
          title="Carnicería Beniken - Video promocional"
        />
        {/* Dark overlay for better text readability */}
        <div className="absolute inset-0 bg-black/40 z-5"></div>
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
      
      {/* Logo - Responsive positioning */}
      <div className="absolute top-16 right-4 sm:top-20 sm:right-8 md:top-24 md:right-12 lg:top-28 lg:right-16 z-20">
        <img
          src="image/logo_listo.png"
          alt="Carnes Beniken Logo"
          className="w-32 h-32 sm:w-40 sm:h-40 md:w-56 md:h-56 lg:w-72 lg:h-72 xl:w-80 xl:h-80 object-contain drop-shadow-2xl"
        />
      </div>

      {/* Content - Mobile optimized */}
      <div className="w-full px-4 sm:px-6 md:px-12 lg:px-16 xl:px-20 relative z-10 pt-8 sm:pt-12 md:pt-16">
        <div className="max-w-4xl">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black text-white mb-4 sm:mb-6 leading-tight tracking-tight" style={{
            textShadow: '4px 4px 8px rgba(0, 0, 0, 0.8), 2px 2px 4px rgba(0, 0, 0, 0.9)',
            fontFamily: 'system-ui, -apple-system, "Segoe UI", "Roboto", "Ubuntu", "Cantarell", sans-serif'
          }}>
            ¡Carne Fresca y de{' '}
            <span className="text-yellow-400 font-black" style={{
              textShadow: '3px 3px 6px rgba(0, 0, 0, 0.9), 1px 1px 3px rgba(184, 134, 11, 0.5)'
            }}>Calidad</span> en Franklin!
          </h1>
          
          <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-white mb-6 sm:mb-8 max-w-2xl font-semibold leading-relaxed" style={{
            textShadow: '2px 2px 4px rgba(0, 0, 0, 0.8)',
            fontFamily: 'system-ui, -apple-system, "Segoe UI", "Roboto", "Ubuntu", "Cantarell", sans-serif'
          }}>
            Vacuno y cerdo de <span className="text-yellow-300 font-bold">primera calidad</span> al mejor precio. <br className="hidden sm:block"/>
            <span className="text-red-200 font-bold text-sm sm:text-base md:text-lg lg:text-xl">Más de 20 años de experiencia</span> en el Mercado Franklin.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-8 sm:mb-12">
            <Link
              to="/productos"
              className="inline-flex items-center justify-center px-6 sm:px-8 py-3 sm:py-4 bg-white text-red-700 font-bold text-base sm:text-lg rounded-lg hover:bg-gray-100 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:-translate-y-1"
            >
              <Eye className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
              Menú de Productos
            </Link>
            
            <a
              href="https://wa.me/56912345678"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center px-6 sm:px-8 py-3 sm:py-4 bg-green-600 text-white font-bold text-base sm:text-lg rounded-lg hover:bg-green-700 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:-translate-y-1"
            >
              <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
              Contactar por WhatsApp
            </a>
          </div>

          {/* Quality Indicators - Mobile optimized */}
          <div className="flex flex-col sm:flex-row sm:flex-wrap gap-3 sm:gap-4 md:gap-6 text-white">
            <div className="flex items-center gap-2 sm:gap-3 bg-black/40 px-3 sm:px-4 py-2 rounded-full backdrop-blur-sm">
              <div className="w-2 h-2 sm:w-3 sm:h-3 bg-yellow-400 rounded-full shadow-lg flex-shrink-0"></div>
              <span className="font-bold text-xs sm:text-sm md:text-base" style={{
                textShadow: '1px 1px 2px rgba(0, 0, 0, 0.8)'
              }}>SIEMPRE FRESCO</span>
            </div>
            <div className="flex items-center gap-2 sm:gap-3 bg-black/40 px-3 sm:px-4 py-2 rounded-full backdrop-blur-sm">
              <div className="w-2 h-2 sm:w-3 sm:h-3 bg-yellow-400 rounded-full shadow-lg flex-shrink-0"></div>
              <span className="font-bold text-xs sm:text-sm md:text-base" style={{
                textShadow: '1px 1px 2px rgba(0, 0, 0, 0.8)'
              }}>PRIMERA CALIDAD</span>
            </div>
            <div className="flex items-center gap-2 sm:gap-3 bg-black/40 px-3 sm:px-4 py-2 rounded-full backdrop-blur-sm">
              <div className="w-2 h-2 sm:w-3 sm:h-3 bg-yellow-400 rounded-full shadow-lg flex-shrink-0"></div>
              <span className="font-bold text-xs sm:text-sm md:text-base" style={{
                textShadow: '1px 1px 2px rgba(0, 0, 0, 0.8)'
              }}>PRECIOS JUSTOS</span>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-4 sm:bottom-8 left-1/2 transform -translate-x-1/2 z-10">
        <div className="w-5 h-8 sm:w-6 sm:h-10 border-2 border-white/30 rounded-full flex justify-center">
          <div className="w-1 h-2 sm:h-3 bg-white/70 rounded-full mt-1 sm:mt-2 animate-bounce"></div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
