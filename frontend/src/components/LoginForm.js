import React, { useState } from 'react';
import { apiFetch } from '../utils/api'; // ← asegura esta ruta correcta: src/utils/api.js

const LoginForm = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      // SOLO email y password
      const data = await apiFetch('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      // Guarda credenciales
      localStorage.setItem('authToken', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      // callback hacia App
      onLoginSuccess?.(data.user);
    } catch (err) {
      // Mensaje que venga del backend o genérico
      const msg = err?.message || 'Correo o contraseña inválidos';
      setError(msg);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 bg-white shadow-lg rounded-lg p-6">
      <h2 className="text-2xl font-bold mb-4 text-center">Iniciar Sesión</h2>
      {error && <p className="text-red-600 text-center mb-2">{error}</p>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-gray-700">Correo</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded"
            placeholder="tuemail@ejemplo.com"
            required
          />
        </div>

        <div>
          <label className="block text-gray-700">Contraseña</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded"
            placeholder="********"
            required
          />
        </div>

        <button
          type="submit"
          className="w-full bg-red-700 text-white p-2 rounded hover:bg-red-800 transition-colors"
        >
          Entrar
        </button>
      </form>
    </div>
  );
};

export default LoginForm;
