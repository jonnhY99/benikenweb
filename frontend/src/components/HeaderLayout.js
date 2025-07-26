import React, { useState } from 'react';

const LayoutHeader = ({ onNavigate, currentPage, user, onLogout }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleNavigate = (page) => {
    onNavigate(page);
    setIsMenuOpen(false); // Cierra el menú en móvil al navegar
  };

  return (
    <header className="bg-red-700 text-white p-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <h1
          className="text-3xl font-bold cursor-pointer"
          onClick={() => onNavigate('home')}
        >
          Carnes Beniken
        </h1>

        <div className="md:hidden">
          <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-white focus:outline-none">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
            </svg>
          </button>
        </div>

        <nav className="hidden md:block">
          <ul className="flex space-x-4">
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
              {user?.role === 'admin' && (
              <li>
              <button
                onClick={() => onNavigate('logs')}
                className={`px-3 py-2 rounded-lg transition-colors ${
                currentPage === 'logs' ? 'bg-red-800' : 'hover:bg-red-600'
                }`}
                >
                Logs de Sesión
              </button>
              </li>
            )}

          </ul>
        </nav>
      </div>
    </header>
  );
};

export default LayoutHeader;
