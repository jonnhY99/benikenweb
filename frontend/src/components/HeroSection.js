import React from 'react';
import { Link } from 'react-router-dom';

const HeroSection = () => {
  return (
    <div className="relative bg-red-700 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="relative z-10 pb-8 bg-red-700 sm:pb-16 md:pb-20 lg:max-w-2xl lg:w-full lg:pb-28 xl:pb-32">
          <div className="pt-10 sm:pt-16 lg:pt-8 lg:pb-14 lg:overflow-hidden">
            <div className="mt-10 mx-auto max-w-7xl px-4 sm:mt-12 sm:px-6 md:mt-16 lg:mt-20 lg:px-8 xl:mt-28">
              <div className="sm:text-center lg:text-left">
                <h1 className="text-4xl tracking-tight font-extrabold sm:text-5xl md:text-6xl">
                  <span className="block text-white drop-shadow-[2px_2px_2px_rgba(0,0,0,0.8)]">
                    Carnicería Beniken
                  </span>
                  <span className="block text-black bg-white px-2 inline-block shadow-md">
                    Vacuno y cerdo de 1ra. calidad
                  </span>
                </h1>
                <p className="mt-3 text-base text-gray-100 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0">
                  Tradición, confianza y excelencia al servicio de nuestros clientes. 
                  Ahora también con plataforma en línea para agilizar tus compras.
                </p>
                <div className="mt-5 sm:mt-8 sm:flex sm:justify-center lg:justify-start">
                  <div className="rounded-md shadow">
                    <Link
                      to="/productos"
                      className="rounded-md flex items-center justify-center px-8 py-3 border border-transparent text-base font-bold text-white bg-black hover:bg-gray-800 md:py-4 md:text-lg md:px-10"
                    >
                      Menú de Productos
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="lg:absolute lg:inset-y-0 lg:right-0 lg:w-1/2">
        <img
          className="h-56 w-full object-cover sm:h-72 md:h-96 lg:w-full lg:h-full opacity-80"
          src="image/carniceria_beniken.png"
          alt="Carnicería Beniken"
        />
      </div>
    </div>
  );
};

export default HeroSection;
