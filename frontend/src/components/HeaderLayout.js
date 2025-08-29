// src/components/HeaderLayout.js
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ShoppingCart, Menu, X, Phone } from 'lucide-react';
import OrderTrackerBanner from './OrderTrackerBanner';

const LayoutHeader = ({ user, onLogout, cartCount }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [title, setTitle] = useState("Carnes Beniken");
  const [fade, setFade] = useState(true);
  const isAdmin = user?.role === 'admin';
  const isButcher = user?.role === 'carniceria';
  const navigate = useNavigate();
  const location = useLocation();

  // Hide tracking banner on order status page
  const shouldShowTrackingBanner = location.pathname !== '/order-status';

  const handleNavigate = (path) => {
    navigate(path);
    setIsMenuOpen(false);
  };

  // 👇 Alternar entre "Carnes Beniken" y "Local 382" con fade
  useEffect(() => {
    const titles = ["Carnes Beniken", "Local 382"];
    let index = 0;

    const interval = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        index = (index + 1) % titles.length;
        setTitle(titles[index]);
        setFade(true);
      }, 500);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <header className="fixed top-0 w-full bg-gradient-to-r from-red-800 via-red-700 to-red-600 backdrop-blur-sm border-b border-red-500/20 shadow-lg z-50">
      {/* 🔔 Banner de seguimiento - oculto en página de estado del pedido */}
      {shouldShowTrackingBanner && <OrderTrackerBanner />}

      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* 👇 Logo/Título animado con diseño moderno */}
          <div className="flex items-center">
            <h1
              className={`text-2xl md:text-3xl font-bold cursor-pointer transition-all duration-500 text-white drop-shadow-lg hover:scale-105 ${
                fade ? "opacity-100" : "opacity-0"
              }`}
              onClick={() => handleNavigate('/')}
            >
              {title}
            </h1>
          </div>

          {/* 🔹 Menú desktop con diseño moderno */}
          <nav className="hidden md:flex items-center space-x-6">
            <button 
              onClick={() => handleNavigate('/')} 
              className="text-white hover:text-yellow-300 transition-colors duration-200 font-medium px-3 py-2 rounded-lg hover:bg-white/10"
            >
              Inicio
            </button>

            {/* ✅ Carrito con diseño moderno */}
            <button
              onClick={() => handleNavigate('/cart')}
              className="relative flex items-center text-white hover:text-yellow-300 transition-colors duration-200 font-medium px-3 py-2 rounded-lg hover:bg-white/10"
            >
              <ShoppingCart className="w-5 h-5 mr-1" />
              <span className="hidden lg:inline">Carrito</span>
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-yellow-400 text-red-800 text-xs font-bold px-2 py-0.5 rounded-full min-w-[20px] text-center">
                  {cartCount}
                </span>
              )}
            </button>

            {(isButcher || isAdmin) && (
              <button 
                onClick={() => handleNavigate('/carniceria')} 
                className="text-white hover:text-yellow-300 transition-colors duration-200 font-medium px-3 py-2 rounded-lg hover:bg-white/10"
              >
                Carnicería
              </button>
            )}
            {isAdmin && (
              <>
                <button 
                  onClick={() => handleNavigate('/usuarios')} 
                  className="text-white hover:text-yellow-300 transition-colors duration-200 font-medium px-3 py-2 rounded-lg hover:bg-white/10"
                >
                  Usuarios
                </button>
                <button 
                  onClick={() => handleNavigate('/reportes')} 
                  className="text-white hover:text-yellow-300 transition-colors duration-200 font-medium px-3 py-2 rounded-lg hover:bg-white/10"
                >
                  Reportes
                </button>
                <button 
                  onClick={() => handleNavigate('/logs')} 
                  className="text-white hover:text-yellow-300 transition-colors duration-200 font-medium px-3 py-2 rounded-lg hover:bg-white/10"
                >
                  Logs
                </button>
              </>
            )}
            
            
            {/* Botón de llamar con diseño moderno */}
            <a
              href="https://wa.me/56912345678"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden lg:flex items-center bg-green-600 hover:bg-green-700 text-white font-medium px-4 py-2 rounded-lg transition-colors duration-200 shadow-lg"
            >
              <Phone className="w-4 h-4 mr-2" />
              Llamar Ahora
            </a>

            {user ? (
              <button 
                onClick={onLogout} 
                className="bg-white/20 hover:bg-white/30 text-white font-medium px-4 py-2 rounded-lg transition-colors duration-200"
              >
                Cerrar sesión
              </button>
            ) : (
              <button 
                onClick={() => handleNavigate('/login')} 
                className="bg-yellow-500 hover:bg-yellow-600 text-red-800 font-medium px-4 py-2 rounded-lg transition-colors duration-200 shadow-lg"
              >
                Iniciar sesión
              </button>
            )}
          </nav>

          {/* 🔹 Botón hamburguesa moderno en móvil */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-white/10 transition-colors duration-200"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? (
              <X className="w-6 h-6 text-white" />
            ) : (
              <Menu className="w-6 h-6 text-white" />
            )}
          </button>
        </div>
      </div>

      {/* 🔹 Menú móvil con diseño moderno */}
      {isMenuOpen && (
        <div className="md:hidden bg-gradient-to-b from-red-700 to-red-800 border-t border-red-500/20 backdrop-blur-sm">
          <nav className="px-4 py-4 space-y-2">
            <button 
              onClick={() => handleNavigate('/')} 
              className="block w-full text-left text-white hover:text-yellow-300 font-medium py-3 px-4 rounded-lg hover:bg-white/10 transition-colors duration-200"
            >
              Inicio
            </button>

            {/* ✅ Carrito con contador en móvil */}
            <button
              onClick={() => handleNavigate('/cart')}
              className="flex items-center w-full text-white hover:text-yellow-300 font-medium py-3 px-4 rounded-lg hover:bg-white/10 transition-colors duration-200"
            >
              <ShoppingCart className="w-5 h-5 mr-3" />
              Carrito
              {cartCount > 0 && (
                <span className="ml-auto bg-yellow-400 text-red-800 text-xs font-bold px-2 py-1 rounded-full">
                  {cartCount}
                </span>
              )}
            </button>

            {(isButcher || isAdmin) && (
              <button 
                onClick={() => handleNavigate('/carniceria')} 
                className="block w-full text-left text-white hover:text-yellow-300 font-medium py-3 px-4 rounded-lg hover:bg-white/10 transition-colors duration-200"
              >
                Carnicería
              </button>
            )}
            {isAdmin && (
              <>
                <button 
                  onClick={() => handleNavigate('/usuarios')} 
                  className="block w-full text-left text-white hover:text-yellow-300 font-medium py-3 px-4 rounded-lg hover:bg-white/10 transition-colors duration-200"
                >
                  Usuarios
                </button>
                <button 
                  onClick={() => handleNavigate('/reportes')} 
                  className="block w-full text-left text-white hover:text-yellow-300 font-medium py-3 px-4 rounded-lg hover:bg-white/10 transition-colors duration-200"
                >
                  Reportes
                </button>
                <button 
                  onClick={() => handleNavigate('/logs')} 
                  className="block w-full text-left text-white hover:text-yellow-300 font-medium py-3 px-4 rounded-lg hover:bg-white/10 transition-colors duration-200"
                >
                  Logs
                </button>
              </>
            )}
            
            
            {/* Botón de llamar en móvil */}
            <a
              href="https://wa.me/56912345678"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 mt-2"
            >
              <Phone className="w-4 h-4 mr-3" />
              Llamar Ahora
            </a>

            {user ? (
              <button 
                onClick={onLogout} 
                className="block w-full text-left bg-white/20 hover:bg-white/30 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 mt-2"
              >
                Cerrar sesión
              </button>
            ) : (
              <button 
                onClick={() => handleNavigate('/login')} 
                className="block w-full text-left bg-yellow-500 hover:bg-yellow-600 text-red-800 font-medium py-3 px-4 rounded-lg transition-colors duration-200 mt-2"
              >
                Iniciar sesión
              </button>
            )}
          </nav>
        </div>
      )}
    </header>
  );
};

export default LayoutHeader;
