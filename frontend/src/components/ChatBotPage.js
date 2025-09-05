import React from 'react';
import ChatBot from './ChatBot';

const ChatBotPage = () => {
  return (
    <div className="container mx-auto p-6 pt-24">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              🤖 Asistente Virtual Beniken
            </h1>
            <p className="text-gray-600">
              ¿Necesitas ayuda navegando la plataforma? Nuestro asistente virtual está aquí para guiarte.
            </p>
          </div>
          
          <div className="bg-gradient-to-r from-red-50 to-red-100 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-red-800 mb-2">¿En qué te puede ayudar?</h3>
            <ul className="text-sm text-red-700 space-y-1">
              <li>• Cómo crear y gestionar pedidos</li>
              <li>• Navegación por el catálogo de productos</li>
              <li>• Seguimiento de pedidos en tiempo real</li>
              <li>• Funciones de administrador</li>
              <li>• Resolución de problemas comunes</li>
            </ul>
          </div>

          <ChatBot />
          
          <div className="mt-6 text-center text-sm text-gray-500">
            <p>Si necesitas ayuda adicional, contacta a nuestro equipo de soporte.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatBotPage;
