import React, { useEffect, useState } from 'react';
import { apiFetch } from '../utils/api';

export default function AdminLoginLogs() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');

  const load = async () => {
    setLoading(true); setErr('');
    try {
      const data = await apiFetch('/api/logs?limit=200');
      setRows(data);
    } catch (e) {
      setErr(e.message || 'Error cargando logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  return (
    <div className="max-w-6xl mx-auto mt-8 bg-white shadow rounded p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Historial de Inicios de Sesión</h2>
        <button
          onClick={load}
          className="px-3 py-2 bg-red-700 text-white rounded hover:bg-red-800"
        >
          Actualizar
        </button>
      </div>

      {err && <p className="text-red-600 mb-3">{err}</p>}

      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="bg-gray-100 text-left">
              <th className="px-4 py-2">Usuario</th>
              <th className="px-4 py-2">Email</th>
              <th className="px-4 py-2">Rol</th>
              <th className="px-4 py-2">IP</th>
              <th className="px-4 py-2">Fecha</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="5" className="px-4 py-6 text-center">Cargando…</td></tr>
            ) : rows.length === 0 ? (
              <tr><td colSpan="5" className="px-4 py-6 text-center">Sin registros</td></tr>
            ) : rows.map(log => (
              <tr key={log._id} className="border-b">
                <td className="px-4 py-2">{log.name}</td>
                <td className="px-4 py-2">{log.email}</td>
                <td className="px-4 py-2 capitalize">{log.role}</td>
                <td className="px-4 py-2">{log.ip || '-'}</td>
                <td className="px-4 py-2">
                  {new Date(log.createdAt).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
