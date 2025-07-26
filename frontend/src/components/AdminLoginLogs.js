import React, { useEffect, useState } from 'react';
import axios from 'axios';

const AdminLoginLogs = () => {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const res = await axios.get('http://localhost:5000/api/users/login-logs', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setLogs(res.data);
      } catch (error) {
        console.error('Error al cargar los logs:', error);
      }
    };
    fetchLogs();
  }, []);

  return (
    <div className="bg-white p-6 shadow rounded-lg">
      <h2 className="text-2xl font-bold mb-4">Historial de Inicios de Sesión</h2>
      <table className="w-full border">
        <thead>
          <tr className="bg-gray-200">
            <th className="p-2 border">Usuario</th>
            <th className="p-2 border">Email</th>
            <th className="p-2 border">Rol</th>
            <th className="p-2 border">Fecha</th>
          </tr>
        </thead>
        <tbody>
          {logs.map((log) => (
            <tr key={log._id} className="text-center">
              <td className="p-2 border">{log.userId?.name || 'Desconocido'}</td>
              <td className="p-2 border">{log.email}</td>
              <td className="p-2 border">{log.userId?.role || '-'}</td>
              <td className="p-2 border">{new Date(log.timestamp).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminLoginLogs;
