import React, { useState } from 'react';

const CustomerForm = ({ onSubmit }) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [pickupTime, setPickupTime] = useState('10:00 AM');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (name && phone && pickupTime) {
      onSubmit({ name, phone, pickupTime });
    } else {
      alert('Por favor, completa todos los campos.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-lg mb-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Datos del Cliente y Recogida</h2>
      <div className="mb-4">
        <label htmlFor="customerName" className="block text-gray-700 text-sm font-bold mb-2">
          Nombre Completo:
        </label>
        <input
          type="text"
          id="customerName"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
          placeholder="Ej. Juan Pérez"
          required
        />
      </div>
      <div className="mb-4">
        <label htmlFor="customerPhone" className="block text-gray-700 text-sm font-bold mb-2">
          Teléfono:
        </label>
        <input
          type="tel"
          id="customerPhone"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
          placeholder="Ej. 5512345678"
          required
        />
      </div>
      <div className="mb-6">
        <label htmlFor="pickupTime" className="block text-gray-700 text-sm font-bold mb-2">
          Hora de Recogida:
        </label>
        <select
          id="pickupTime"
          value={pickupTime}
          onChange={(e) => setPickupTime(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
          required
        >
          <option value="10:00 AM">10:00 AM</option>
          <option value="11:00 AM">11:00 AM</option>
          <option value="12:00 PM">12:00 PM</option>
          <option value="01:00 PM">01:00 PM</option>
          <option value="02:00 PM">02:00 PM</option>
          <option value="03:00 PM">03:00 PM</option>
          <option value="04:00 PM">04:00 PM</option>
          <option value="05:00 PM">05:00 PM</option>
        </select>
      </div>
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