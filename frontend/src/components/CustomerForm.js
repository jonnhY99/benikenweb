// src/components/CustomerForm.js
import React, { useState } from 'react';
import { apiFetch } from '../utils/api';
import { useToast } from '../context/ToastContext';

const CustomerForm = ({ onSubmit }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [note, setNote] = useState('');
  const [pickupTime, setPickupTime] = useState('10:00 AM');
  const { addToast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (name && phone && email && pickupTime) {
      const customerData = { name, phone, email, pickupTime, note };

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
    } else {
      addToast('Por favor, completa todos los campos obligatorios.', 'error');
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

      <div className="mb-4">
        <label className="block text-gray-700 font-bold mb-1">
          Hora de Recogida:
        </label>
        <select
          value={pickupTime}
          onChange={(e) => setPickupTime(e.target.value)}
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
          required
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

      <p className="text-gray-600 text-sm mb-4">
        *Recuerda que el pedido es para retiro en Mercado Matadero Franklin, local 382, Santiago.
      </p>
      <p className="text-gray-600 text-sm mb-4">
        *Si tienes dudas, contáctanos al +56933997*** o por correo carnes@beniken.com
      </p>

      <button
        type="submit"
        className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors text-lg font-semibold"
      >
        Confirmar Pedido
      </button>
    </form>
  );
};

export default CustomerForm;
