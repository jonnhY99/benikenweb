import React from 'react';
import { Link } from 'react-router-dom';
import { Eye, MessageCircle, Check } from 'lucide-react';

const HeroSection = () => {
  return (
    <section id="inicio" className="relative min-h-screen flex items-center overflow-hidden -mt-24 pt-20 pb-4">
      {/* Background Video with Mobile Fallback */}
      <div className="absolute inset-0 z-0">
        {/* Mobile: Use static background image as fallback */}
        <div className="block sm:hidden absolute inset-0 w-full h-full">
          <div 
            className="w-full h-full bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: 'url("image/carne_de_vacuno.png")',
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          >
            {/* Try to load video, but don't break if it fails */}
            <iframe
              src="https://player.cloudinary.com/embed/?cloud_name=dyeotzjo8&public_id=kling_20250828_Image_to_Video__3129_0_kqksco&profile=carne2"
              className="w-full h-full opacity-90"
              style={{ 
                border: 'none',
                pointerEvents: 'none'
              }}
              allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
              allowFullScreen
              frameBorder="0"
              title="Carnicería Beniken - Video móvil"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          </div>
        </div>
        
        {/* Desktop/Tablet Video */}
        <iframe
          src="https://player.cloudinary.com/embed/?cloud_name=dyeotzjo8&public_id=kling_20250828_Image_to_Video__3129_0_kqksco&profile=carne2"
          className="hidden sm:block w-full h-full"
          style={{ 
            minHeight: '100vh',
            minWidth: '100vw',
            border: 'none',
            pointerEvents: 'none',
            objectFit: 'cover'
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
      
      {/* Content - Mobile optimized with logo integration */}
      <div className="w-full px-4 sm:px-6 md:px-12 lg:px-16 xl:px-20 relative z-10 pt-4 sm:pt-6 md:pt-8">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row lg:items-center lg:justify-between lg:gap-8">
          
          {/* Main content */}
          <div className="flex-1 lg:max-w-4xl">
            <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl font-black text-white mb-2 sm:mb-3 md:mb-4 leading-tight tracking-tight" style={{
              textShadow: '4px 4px 8px rgba(0, 0, 0, 0.8), 2px 2px 4px rgba(0, 0, 0, 0.9)',
              fontFamily: 'system-ui, -apple-system, "Segoe UI", "Roboto", "Ubuntu", "Cantarell", sans-serif'
            }}>
              ¡Carne Fresca y de{' '}
              <span className="text-yellow-400 font-black" style={{
                textShadow: '3px 3px 6px rgba(0, 0, 0, 0.9), 1px 1px 3px rgba(184, 134, 11, 0.5)'
              }}>Calidad</span> en Franklin!
            </h1>
            
            <p className="text-xs sm:text-sm md:text-base lg:text-lg text-white mb-3 sm:mb-4 md:mb-6 max-w-2xl font-semibold leading-relaxed" style={{
              textShadow: '2px 2px 4px rgba(0, 0, 0, 0.8)',
              fontFamily: 'system-ui, -apple-system, "Segoe UI", "Roboto", "Ubuntu", "Cantarell", sans-serif'
            }}>
              Vacuno y cerdo de <span className="text-yellow-300 font-bold">primera calidad</span> al mejor precio. <br className="hidden sm:block"/>
              <span className="text-red-200 font-bold text-xs sm:text-sm md:text-base lg:text-lg">Más de 20 años de experiencia</span> en el Mercado Franklin.
            </p>

            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mb-4 sm:mb-6">
              <Link
                to="/productos"
                className="inline-flex items-center justify-center px-4 sm:px-6 py-2 sm:py-3 bg-white text-red-700 font-bold text-sm sm:text-base rounded-lg hover:bg-gray-100 transition-all duration-300 shadow-lg"
              >
                <Eye className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                Menú de Productos
              </Link>
              
              <a
                href="https://wa.me/56912345678"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center px-4 sm:px-6 py-2 sm:py-3 bg-green-600 text-white font-bold text-sm sm:text-base rounded-lg hover:bg-green-700 transition-all duration-300 shadow-lg"
              >
                <MessageCircle className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
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

          {/* Logo - Mobile below content, Desktop beside content */}
          <div className="flex justify-center mt-4 sm:mt-6 lg:justify-end lg:mt-0 lg:flex-shrink-0">
            <img 
              src="image/logo_listo.png" 
              alt="Carnes Beniken Logo" 
              className="w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 lg:w-56 lg:h-56 xl:w-72 xl:h-72 object-contain drop-shadow-2xl" 
            />
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
