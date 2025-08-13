import React, { useState } from 'react';
import { apiFetch } from '../utils/api'; // usa el helper que adjunta el Bearer token

const LoginForm = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Llamada al backend (devuelve { token, user })
      const { token, user } = await apiFetch('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      // Guarda en localStorage con claves consistentes
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      // Notifica éxito al padre (si no viene, recarga o navega al home)
      if (typeof onLoginSuccess === 'function') {
        onLoginSuccess(user);
      } else {
        window.location.href = '/';
      }
    } catch (err) {
      // apiFetch lanza Error(msg) con el mensaje del backend si existe
      setError(err.message || 'Correo o contraseña inválidos');
    } finally {
      setLoading(false);
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
            placeholder="tuemail@beniken.com"
            autoComplete="username"
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
            autoComplete="current-password"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full p-2 rounded text-white transition-colors ${
            loading ? 'bg-red-400 cursor-not-allowed' : 'bg-red-700 hover:bg-red-800'
          }`}
        >
          {loading ? 'Ingresando...' : 'Entrar'}
        </button>
      </form>
    </div>
  );
};

export default LoginForm;
