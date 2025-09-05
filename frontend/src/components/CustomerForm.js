// src/components/CustomerForm.js
import React, { useState } from 'react';
import { apiFetch } from '../utils/api';
import { useToast } from '../context/ToastContext';

const CustomerForm = ({ onSubmit, totalAmount = 0 }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [note, setNote] = useState('');
  const [selectedComuna, setSelectedComuna] = useState('');
  const [enabledComunas, setEnabledComunas] = useState(new Set([
    'Las Condes', 'Providencia', 'Ñuñoa', 'Santiago Centro', 'Vitacura',
    'Lo Barnechea', 'La Reina', 'Peñalolén', 'Macul', 'San Joaquín',
    'La Florida', 'Puente Alto', 'Maipú', 'Quilicura', 'Huechuraba',
    'Independencia', 'Recoleta', 'Conchalí', 'Quinta Normal', 'Estación Central'
  ]));
  const [showComunaSelector, setShowComunaSelector] = useState(false);
  const [isFrequentUser, setIsFrequentUser] = useState(false);
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [isDelivery, setIsDelivery] = useState(false);
  const [pickupTime, setPickupTime] = useState('10:00 AM');
  const { addToast } = useToast();
  
  // 🚚 Despacho solo si el total >= 100.000 CLP
  const isDeliveryAvailable = totalAmount >= 100000;

  // 🔧 Funciones para manejar comunas seleccionables
  const toggleComuna = (comuna) => {
    const newEnabledComunas = new Set(enabledComunas);
    if (newEnabledComunas.has(comuna)) {
      newEnabledComunas.delete(comuna);
      // Si se deshabilita la comuna seleccionada, limpiar selección
      if (selectedComuna === comuna) {
        setSelectedComuna('');
      }
    } else {
      newEnabledComunas.add(comuna);
    }
    setEnabledComunas(newEnabledComunas);
  };

  const enableAllComunas = () => {
    setEnabledComunas(new Set([
      'Las Condes', 'Providencia', 'Ñuñoa', 'Santiago Centro', 'Vitacura',
      'Lo Barnechea', 'La Reina', 'Peñalolén', 'Macul', 'San Joaquín',
      'La Florida', 'Puente Alto', 'Maipú', 'Quilicura', 'Huechuraba',
      'Independencia', 'Recoleta', 'Conchalí', 'Quinta Normal', 'Estación Central'
    ]));
  };

  const disableAllComunas = () => {
    setEnabledComunas(new Set());
    setSelectedComuna('');
  };

  // ✅ Validaciones
  const validateName = (n) =>
    /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s'-]+$/.test(n.trim()) && n.trim().length >= 2;

  const validateEmail = (e) =>
    /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(e.trim());

  const validatePhone = (p) => /^\+569[0-9]{8}$/.test(p.trim());

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateName(name)) return addToast('Nombre inválido.', 'error');
    if (!validateEmail(email)) return addToast('Correo inválido.', 'error');
    if (!validatePhone(phone)) return addToast('Teléfono inválido.', 'error');
    if (isDelivery && !deliveryAddress.trim())
      return addToast('Debes ingresar dirección.', 'error');
    if (isDelivery && !selectedComuna)
      return addToast('Debes seleccionar una comuna.', 'error');
    if (isDelivery && enabledComunas.size === 0)
      return addToast('No hay comunas habilitadas para despacho.', 'error');

    {
      const customerData = { 
        name, 
        phone, 
        email, 
        pickupTime: isDelivery ? null : pickupTime, 
        note,
        isDelivery,
        deliveryAddress: isDelivery ? deliveryAddress : null,
        selectedComuna: isDelivery ? selectedComuna : null,
      };

      try {
        // ✅ Registrar compra en backend
        await apiFetch('/api/users/purchase', {
          method: 'POST',
          body: JSON.stringify({ email }),
        });

        addToast('Compra registrada correctamente ✅');

        // 🔔 Emitir evento global para actualizar "Usuarios Frecuentes"
        window.dispatchEvent(new Event('userFrequentUpdated'));

        // continuar con el flujo normal
        onSubmit(customerData);
      } catch (err) {
        addToast('Error registrando compra ❌', 'error');
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-lg mb-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">
        Datos del Cliente y Recogida
      </h2>

      <div className="mb-4">
        <label className="block text-gray-700 font-bold mb-1">
          Nombre Completo:
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
          placeholder="Ej. Juan Pérez"
          required
        />
      </div>

      <div className="mb-4">
        <label className="block text-gray-700 font-bold mb-1">
          Correo Electrónico:
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
          placeholder="Ej. carnes@beniken.com"
          required
        />
      </div>

      <div className="mb-4">
        <label className="block text-gray-700 font-bold mb-1">
          Teléfono:
        </label>
        <input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
          placeholder="Ej. 5512345678"
          required
        />
      </div>

      {/* Delivery Option - Only show if total >= 100,000 CLP */}
      {isDeliveryAvailable && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center mb-3">
            <input
              type="checkbox"
              id="delivery"
              checked={isDelivery}
              onChange={(e) => {
                setIsDelivery(e.target.checked);
                if (!e.target.checked) {
                  setDeliveryAddress('');
                }
              }}
              className="mr-3 h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
            />
            <label htmlFor="delivery" className="text-green-700 font-bold">
              🚚 Despacho a Domicilio Disponible
            </label>
          </div>
          
          {isDelivery && (
            <div className="space-y-4">
              {/* Selector de comunas disponibles */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <label className="text-blue-700 font-bold">⚙️ Configurar Comunas Disponibles</label>
                  <button
                    type="button"
                    onClick={() => setShowComunaSelector(!showComunaSelector)}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    {showComunaSelector ? '🔼 Ocultar' : '🔽 Mostrar'}
                  </button>
                </div>

                {showComunaSelector && (
                  <div className="space-y-3">
                    <div className="flex gap-2 mb-3">
                      <button
                        type="button"
                        onClick={enableAllComunas}
                        className="px-3 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600"
                      >
                        ✅ Todas
                      </button>
                      <button
                        type="button"
                        onClick={disableAllComunas}
                        className="px-3 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600"
                      >
                        ❌ Ninguna
                      </button>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-40 overflow-y-auto">
                      {[
                        'Las Condes', 'Providencia', 'Ñuñoa', 'Santiago Centro', 'Vitacura',
                        'Lo Barnechea', 'La Reina', 'Peñalolén', 'Macul', 'San Joaquín',
                        'La Florida', 'Puente Alto', 'Maipú', 'Quilicura', 'Huechuraba',
                        'Independencia', 'Recoleta', 'Conchalí', 'Quinta Normal', 'Estación Central'
                      ].map((comuna) => (
                        <label key={comuna} className="flex items-center space-x-2 text-sm">
                          <input
                            type="checkbox"
                            checked={enabledComunas.has(comuna)}
                            onChange={() => toggleComuna(comuna)}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <span className={enabledComunas.has(comuna) ? 'text-blue-700' : 'text-gray-500'}>
                            {comuna}
                          </span>
                        </label>
                      ))}
                    </div>
                    
                    <p className="text-blue-600 text-xs mt-2">
                      📍 {enabledComunas.size} de 20 comunas habilitadas
                    </p>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-green-700 font-bold mb-1">Comuna de Despacho:</label>
                <select
                  value={selectedComuna}
                  onChange={(e) => setSelectedComuna(e.target.value)}
                  className="w-full px-4 py-2 border border-green-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  required={isDelivery}
                >
                  <option value="">Selecciona tu comuna</option>
                  {Array.from(enabledComunas).sort().map((comuna) => (
                    <option key={comuna} value={comuna}>{comuna}</option>
                  ))}
                </select>
                {enabledComunas.size === 0 && (
                  <p className="text-red-500 text-xs mt-1">⚠️ No hay comunas habilitadas para despacho</p>
                )}
              </div>

              <div>
                <label className="block text-green-700 font-bold mb-1">
                  Dirección de Despacho:
                </label>
                <input
                  type="text"
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  className="w-full px-4 py-2 border border-green-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Ej. Av. Siempre Viva 742"
                  required={isDelivery}
                />
                <p className="text-green-600 text-sm mt-1">
                  *El despacho se realizará en horario de 14:00 a 18:00 hrs
                </p>
              </div>
            </div>
          )}
        </div>
      )}
      
      {/* Pickup Time - Only show if not delivery */}
      {!isDelivery && (
        <div className="mb-4">
          <label className="block text-gray-700 font-bold mb-1">
            Hora de Recogida:
          </label>
          <select
            value={pickupTime}
            onChange={(e) => setPickupTime(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
            required={!isDelivery}
          >
            {[
              '06:30 AM','07:00 AM','07:30 AM','08:00 AM','08:30 AM','09:00 AM','09:30 AM',
              '10:00 AM','10:30 AM','11:00 AM','11:30 AM','12:00 PM','12:30 PM','01:00 PM',
              '01:30 PM','02:00 PM','02:30 PM'
            ].map((time) => (
              <option key={time} value={time}>{time}</option>
            ))}
          </select>
        </div>
      )}

      <div className="mb-4">
        <label className="block text-gray-700 font-bold mb-1">
          Notas Adicionales:
        </label>
        <input
          type="text"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
          placeholder="Ej. Por favor, no olvides traer tu cédula de identidad."
        />
      </div>

      {!isDelivery && (
        <p className="text-gray-600 text-sm mb-4">
          *Recuerda que el pedido es para retiro en Mercado Matadero Franklin, local 382, Santiago.
        </p>
      )}
      
      {isDelivery && (
        <p className="text-green-600 text-sm mb-4">
          *Tu pedido será despachado a la dirección indicada entre las 14:00 y 18:00 hrs.
        </p>
      )}
      
      {!isDeliveryAvailable && totalAmount > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
          <p className="text-yellow-700 text-sm">
            💡 <strong>¡Tip!</strong> Agrega ${(100000 - totalAmount).toLocaleString('es-CL')} más a tu compra para habilitar el despacho a domicilio.
          </p>
        </div>
      )}
      
      <p className="text-gray-600 text-sm mb-4">
        *Si tienes dudas, contáctanos al +56933997*** o por correo carnes@beniken.com
      </p>

      <button
        type="submit"
        className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors text-lg font-semibold"
      >
        {isDelivery ? 'Confirmar Pedido con Despacho' : 'Confirmar Pedido para Retiro'}
      </button>
    </form>
  );
};

export default CustomerForm;
