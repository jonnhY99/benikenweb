// src/components/HeaderLayout.js
import React, { useState } from 'react';

const LayoutHeader = ({ onNavigate, currentPage, user, onLogout, trackingOrderId }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const isAdmin = user?.role === 'admin';
  const isButcher = user?.role === 'carniceria';

  const handleNavigate = (page) => {
    onNavigate(page);
    setIsMenuOpen(false); // cierra menú móvil al navegar
  };

  const showTrackingBanner = trackingOrderId && currentPage !== 'orderStatus';

  return (
    <header className="bg-red-700 text-white shadow-md">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <h1
          className="text-3xl font-bold cursor-pointer"
          onClick={() => handleNavigate('home')}
        >
          Carnes Beniken
        </h1>

        {/* Toggle menú móvil */}
        <div className="md:hidden">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="text-white focus:outline-none"
            aria-label="Abrir menú"
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        {/* Menú desktop */}
        <nav className="hidden md:block">
          <ul className="flex space-x-3">
            {/* Seguimiento visible si hay pedido en curso */}
            {trackingOrderId && (
              <li>
                <button
                  onClick={() => handleNavigate('orderStatus')}
                  className={`px-3 py-2 rounded-lg transition-colors ${
                    currentPage === 'orderStatus' ? 'bg-yellow-500 text-black' : 'bg-yellow-300 text-black hover:bg-yellow-400'
                  }`}
                  title={`Ver seguimiento pedido ${trackingOrderId}`}
                >
                  Seguimiento
                </button>
              </li>
            )}

            <li>
              <button
                onClick={() => handleNavigate('home')}
                className={`px-3 py-2 rounded-lg transition-colors ${
                  currentPage === 'home' ? 'bg-red-800' : 'hover:bg-red-600'
                }`}
              >
                Inicio
              </button>
            </li>

            <li>
              <button
                onClick={() => handleNavigate('cart')}
                className={`px-3 py-2 rounded-lg transition-colors ${
                  currentPage === 'cart' ? 'bg-red-800' : 'hover:bg-red-600'
                }`}
              >
                Carrito
              </button>
            </li>

            {(isButcher || isAdmin) && (
              <li>
                <button
                  onClick={() => handleNavigate('carniceria')}
                  className={`px-3 py-2 rounded-lg transition-colors ${
                    currentPage === 'carniceria' ? 'bg-red-800' : 'hover:bg-red-600'
                  }`}
                >
                  Pedidos
                </button>
              </li>
            )}

            {isAdmin && (
              <>
                <li>
                  <button
                    onClick={() => handleNavigate('reportes')}
                    className={`px-3 py-2 rounded-lg transition-colors ${
                      currentPage === 'reportes' ? 'bg-red-800' : 'hover:bg-red-600'
                    }`}
                  >
                    Reportes
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => handleNavigate('logs')}
                    className={`px-3 py-2 rounded-lg transition-colors ${
                      currentPage === 'logs' ? 'bg-red-800' : 'hover:bg-red-600'
                    }`}
                  >
                    Logs de Sesión
                  </button>
                </li>
              </>
            )}

            {!user ? (
              <li>
                <button
                  onClick={() => handleNavigate('login')}
                  className={`px-3 py-2 rounded-lg transition-colors ${
                    currentPage === 'login' ? 'bg-red-800' : 'hover:bg-red-600'
                  }`}
                >
                  Iniciar Sesión
                </button>
              </li>
            ) : (
              <li>
                <button
                  onClick={onLogout}
                  className="px-3 py-2 rounded-lg hover:bg-red-600"
                >
                  Cerrar Sesión
                </button>
              </li>
            )}
          </ul>
        </nav>
      </div>

      {/* Banner guía si hay pedido en curso y no estamos en la pantalla de seguimiento */}
      {showTrackingBanner && (
        <div className="bg-yellow-100 text-yellow-900">
          <div className="container mx-auto px-4 py-2 flex flex-wrap items-center justify-between gap-3">
            <span>
              Tienes un pedido en preparación: <b>{trackingOrderId}</b>
            </span>
            <button
              onClick={() => handleNavigate('orderStatus')}
              className="px-3 py-1 rounded bg-yellow-400 text-black hover:bg-yellow-500"
            >
              Ver seguimiento
            </button>
          </div>
        </div>
      )}

      {/* Menú móvil */}
      <nav className={`md:hidden ${isMenuOpen ? 'block' : 'hidden'} px-4 pb-4`}>
        <ul className="mt-3 space-y-2">
          {trackingOrderId && (
            <li>
              <button
                onClick={() => handleNavigate('orderStatus')}
                className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                  currentPage === 'orderStatus'
                    ? 'bg-yellow-500 text-black'
                    : 'bg-yellow-300 text-black hover:bg-yellow-400'
                }`}
              >
                Seguimiento
              </button>
            </li>
          )}

          <li>
            <button
              onClick={() => handleNavigate('home')}
              className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                currentPage === 'home' ? 'bg-red-800' : 'hover:bg-red-600'
              }`}
            >
              Inicio
            </button>
          </li>

          <li>
            <button
              onClick={() => handleNavigate('cart')}
              className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                currentPage === 'cart' ? 'bg-red-800' : 'hover:bg-red-600'
              }`}
            >
              Carrito
            </button>
          </li>

          {(isButcher || isAdmin) && (
            <li>
              <button
                onClick={() => handleNavigate('carniceria')}
                className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                  currentPage === 'carniceria' ? 'bg-red-800' : 'hover:bg-red-600'
                }`}
              >
                Pedidos
              </button>
            </li>
          )}

          {isAdmin && (
            <>
              <li>
                <button
                  onClick={() => handleNavigate('reportes')}
                  className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                    currentPage === 'reportes' ? 'bg-red-800' : 'hover:bg-red-600'
                  }`}
                >
                  Reportes
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNavigate('logs')}
                  className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                    currentPage === 'logs' ? 'bg-red-800' : 'hover:bg-red-600'
                  }`}
                >
                  Logs de Sesión
                </button>
              </li>
            </>
          )}

          {!user ? (
            <li>
              <button
                onClick={() => handleNavigate('login')}
                className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                  currentPage === 'login' ? 'bg-red-800' : 'hover:bg-red-600'
                }`}
              >
                Iniciar Sesión
              </button>
            </li>
          ) : (
            <li>
              <button
                onClick={() => { onLogout(); setIsMenuOpen(false); }}
                className="w-full text-left px-3 py-2 rounded-lg hover:bg-red-600"
              >
                Cerrar Sesión
              </button>
            </li>
          )}
        </ul>
      </nav>
    </header>
  );
};

export default LayoutHeader;
