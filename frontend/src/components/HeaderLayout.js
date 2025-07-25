import React, { useState } from 'react';

const LayoutHeader = ({ onNavigate, currentPage }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleNavigate = (page) => {
    onNavigate(page);
    setIsMenuOpen(false); // Close menu after navigation
  };

  return (
    <header className="bg-red-700 text-white p-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <h1 className="text-3xl font-bold">Carnes Cien</h1>

        {/* Hamburger button for mobile */}
        <div className="md:hidden">
          <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-white focus:outline-none">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
            </svg>
          </button>
        </div>

        {/* Desktop Navigation */}
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
            <li>
              <button
                onClick={() => handleNavigate('admin')}
                className={`px-3 py-2 rounded-lg transition-colors ${
                  currentPage === 'admin' ? 'bg-red-800' : 'hover:bg-red-600'
                }`}
              >
                Administración
              </button>
            </li>
          </ul>
        </nav>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <nav className="md:hidden mt-4">
          <ul className="flex flex-col space-y-2">
            <li>
              <button
                onClick={() => handleNavigate('home')}
                className={`block w-full text-left px-3 py-2 rounded-lg transition-colors ${
                  currentPage === 'home' ? 'bg-red-800' : 'hover:bg-red-600'
                }`}
              >
                Inicio
              </button>
            </li>
            <li>
              <button
                onClick={() => handleNavigate('cart')}
                className={`block w-full text-left px-3 py-2 rounded-lg transition-colors ${
                  currentPage === 'cart' ? 'bg-red-800' : 'hover:bg-red-600'
                }`}
              >
                Carrito
              </button>
            </li>
            <li>
              <button
                onClick={() => handleNavigate('admin')}
                className={`block w-full text-left px-3 py-2 rounded-lg transition-colors ${
                  currentPage === 'admin' ? 'bg-red-800' : 'hover:bg-red-600'
                }`}
              >
                Administración
              </button>
            </li>
          </ul>
        </nav>
      )}
    </header>
  );
};

export default LayoutHeader;