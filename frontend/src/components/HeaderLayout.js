// src/components/HeaderLayout.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react'; // ✅ Icono carrito (lucide-react recomendado)
import OrderTrackerBanner from './OrderTrackerBanner';

const LayoutHeader = ({ user, onLogout, cartCount }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [title, setTitle] = useState("Carnes Beniken");
  const [fade, setFade] = useState(true);
  const isAdmin = user?.role === 'admin';
  const isButcher = user?.role === 'carniceria';
  const navigate = useNavigate();

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
    <header className="bg-red-700 text-white shadow-md sticky top-0 z-50">
      {/* 🔔 Banner de seguimiento */}
      <OrderTrackerBanner />

      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        {/* 👇 Título animado */}
        <h1
          className={`text-3xl font-bold cursor-pointer transition-opacity duration-500 ${
            fade ? "opacity-100" : "opacity-0"
          }`}
          onClick={() => handleNavigate('/')}
        >
          {title}
        </h1>

        {/* 🔹 Menú desktop */}
        <nav className="hidden md:flex space-x-6 items-center">
          <button onClick={() => handleNavigate('/')} className="hover:text-gray-200">
            Inicio
          </button>

          {/* ✅ Carrito con icono y contador */}
          <button
            onClick={() => handleNavigate('/cart')}
            className="relative flex items-center hover:text-gray-200"
          >
            <ShoppingCart className="w-6 h-6" />
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-yellow-400 text-black text-xs font-bold px-2 py-0.5 rounded-full">
                {cartCount}
              </span>
            )}
          </button>

          {(isButcher || isAdmin) && (
            <button onClick={() => handleNavigate('/carniceria')} className="hover:text-gray-200">
              Carnicería
            </button>
          )}
          {isAdmin && (
            <>
              <button onClick={() => handleNavigate('/usuarios')} className="hover:text-gray-200">
                Usuarios
              </button>
              <button onClick={() => handleNavigate('/reportes')} className="hover:text-gray-200">
                Reportes
              </button>
              <button onClick={() => handleNavigate('/logs')} className="hover:text-gray-200">
                Logs
              </button>
            </>
          )}
          {user ? (
            <button onClick={onLogout} className="hover:text-gray-200">
              Cerrar sesión
            </button>
          ) : (
            <button onClick={() => handleNavigate('/login')} className="hover:text-gray-200">
              Iniciar sesión
            </button>
          )}
        </nav>

        {/* 🔹 Botón hamburguesa en móvil */}
        <button
          className="md:hidden focus:outline-none"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <svg
            className="w-8 h-8"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            {isMenuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* 🔹 Menú móvil */}
      {isMenuOpen && (
        <nav className="md:hidden bg-red-600 text-white px-4 py-4 space-y-3">
          <button onClick={() => handleNavigate('/')} className="block w-full text-left">
            Inicio
          </button>

          {/* ✅ Carrito con contador en móvil */}
          <button
            onClick={() => handleNavigate('/cart')}
            className="block w-full text-left flex items-center gap-2"
          >
            <ShoppingCart className="w-5 h-5" />
            Carrito
            {cartCount > 0 && (
              <span className="ml-2 bg-yellow-400 text-black text-xs font-bold px-2 py-0.5 rounded-full">
                {cartCount}
              </span>
            )}
          </button>

          {(isButcher || isAdmin) && (
            <button onClick={() => handleNavigate('/carniceria')} className="block w-full text-left">
              Carnicería
            </button>
          )}
          {isAdmin && (
            <>
              <button onClick={() => handleNavigate('/usuarios')} className="block w-full text-left">
                Usuarios
              </button>
              <button onClick={() => handleNavigate('/reportes')} className="block w-full text-left">
                Reportes
              </button>
              <button onClick={() => handleNavigate('/logs')} className="block w-full text-left">
                Logs
              </button>
            </>
          )}
          {user ? (
            <button onClick={onLogout} className="block w-full text-left">
              Cerrar sesión
            </button>
          ) : (
            <button onClick={() => handleNavigate('/login')} className="block w-full text-left">
              Iniciar sesión
            </button>
          )}
        </nav>
      )}
    </header>
  );
};

export default LayoutHeader;
