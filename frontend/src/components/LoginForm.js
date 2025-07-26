import React, { useState } from 'react';
import axios from 'axios';

const LoginForm = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Llamada al backend para autenticar
      const res = await axios.post('http://localhost:5000/api/users/login', {
        email,
        password,
      });

      // Verificar que el backend devolvió token y usuario
      if (!res.data || !res.data.token || !res.data.user) {
        throw new Error('Respuesta inválida del servidor');
      }

      const { token, user } = res.data;

      // Guardar token y datos de usuario en localStorage
      localStorage.setItem('authToken', token);
      localStorage.setItem('user', JSON.stringify(user));

      // Limpiar errores previos y redirigir al home
      setError('');
      onLoginSuccess(user);
    } catch (err) {
      // Manejo de error más detallado
      if (err.response && err.response.data?.message) {
        setError(err.response.data.message); // usa mensaje del backend si existe
      } else {
        setError('Correo o contraseña inválidos');
      }
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
