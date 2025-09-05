// frontend/src/components/AdminLoginLogs.js
import React, { useEffect, useMemo, useState } from 'react';
import { apiFetch } from '../utils/api'; // asegúrate que existe (como hicimos)
                                        // y agrega el token automáticamente

const ROLES = [
  { value: '', label: 'Todos' },
  { value: 'admin', label: 'Admin' },
  { value: 'carniceria', label: 'Carnicería' },
  { value: 'cliente', label: 'Cliente' },
];

const formatDate = (v) => {
  const d = v ? new Date(v) : null;
  return (d && !isNaN(d)) ? d.toLocaleString('es-CL', { hour12: false }) : '-';
};

export default function AdminLoginLogs() {
  const [items, setItems] = useState([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, pages: 1, limit: 20 });

  // filtros
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [limit, setLimit] = useState(20);
  const [sort, setSort] = useState('desc');
  const [page, setPage] = useState(1);

  // selección para borrado
  const [selected, setSelected] = useState(new Set());
  const allSelected = useMemo(
    () => items.length > 0 && items.every(x => selected.has(x._id)),
    [items, selected]
  );

  const fetchLogs = async (goToPage = page) => {
    const qs = new URLSearchParams({
      page: String(goToPage),
      limit: String(limit),
      sort,
    });
    if (search) qs.set('search', search);
    if (role) qs.set('role', role);
    if (from) qs.set('from', from);
    if (to)   qs.set('to', to);

    const res = await apiFetch(`/api/logs?${qs.toString()}`);
    setItems(res.items || []);
    setMeta(res.meta || { total: 0, page: goToPage, pages: 1, limit });
    setPage(res.meta?.page || goToPage);
    setSelected(new Set());
  };

 useEffect(() => {
  fetchLogs(1);
}, [limit, sort]); // sin comentario


  const onApplyFilters = () => fetchLogs(1);
  const onClearFilters = () => {
    setSearch(''); setRole(''); setFrom(''); setTo('');
    fetchLogs(1);
  };

  const toggleRow = (id) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelected(next);
  };

  const toggleAll = () => {
    if (allSelected) {
      setSelected(new Set());
    } else {
      setSelected(new Set(items.map(x => x._id)));
    }
  };

  const deleteSelected = async () => {
    if (!selected.size) return;
    if (!window.confirm(`¿Eliminar ${selected.size} registro(s) seleccionados?`)) return;

    await apiFetch('/api/logs', {
      method: 'DELETE',
      body: JSON.stringify({ ids: Array.from(selected) }),
    });
    fetchLogs();
  };

  const deleteBefore = async () => {
    const date = prompt('Eliminar todos los logs ANTES de (YYYY-MM-DD):');
    if (!date) return;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return alert('Formato inválido');
    if (!window.confirm(`¿Eliminar logs anteriores a ${date}?`)) return;

    await apiFetch('/api/logs', {
      method: 'DELETE',
      body: JSON.stringify({ before: new Date(`${date}T00:00:00`).toISOString() }),
    });
    fetchLogs();
  };

  const deleteRange = async () => {
    const a = prompt('Eliminar logs DESDE (YYYY-MM-DD):') || '';
    const b = prompt('Eliminar logs HASTA (YYYY-MM-DD):') || '';
    if (!a && !b) return;
    if (a && !/^\d{4}-\d{2}-\d{2}$/.test(a)) return alert('Desde inválido');
    if (b && !/^\d{4}-\d{2}-\d{2}$/.test(b)) return alert('Hasta inválido');

    await apiFetch('/api/logs', {
      method: 'DELETE',
      body: JSON.stringify({
        from: a ? new Date(`${a}T00:00:00`).toISOString() : undefined,
        to:   b ? new Date(`${b}T23:59:59`).toISOString() : undefined,
      }),
    });
    fetchLogs();
  };

  const deleteAll = async () => {
    if (!window.confirm('⚠️ Esto eliminará TODOS los logs. ¿Continuar?')) return;
    await apiFetch('/api/logs', { method: 'DELETE', body: JSON.stringify({ all: true }) });
    fetchLogs(1);
  };

  const goPrev = () => page > 1 && fetchLogs(page - 1);
  const goNext = () => page < meta.pages && fetchLogs(page + 1);

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">Historial de Inicios de Sesión</h2>

      {/* Filtros */}
      <div className="bg-white rounded-lg shadow p-4 mb-4 grid grid-cols-1 md:grid-cols-6 gap-3">
        <input
          className="border rounded p-2 col-span-2"
          placeholder="Buscar nombre, email, IP..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="border rounded p-2"
          value={role}
          onChange={(e) => setRole(e.target.value)}
        >
          {ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
        </select>
        <input type="date" className="border rounded p-2" value={from} onChange={e=>setFrom(e.target.value)} />
        <input type="date" className="border rounded p-2" value={to}   onChange={e=>setTo(e.target.value)} />
        <div className="flex gap-2">
          <button onClick={onApplyFilters} className="bg-red-700 text-white px-3 rounded hover:bg-red-800">Aplicar</button>
          <button onClick={onClearFilters} className="bg-gray-200 px-3 rounded hover:bg-gray-300">Limpiar</button>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm">Orden:</label>
          <select className="border rounded p-2" value={sort} onChange={(e)=>setSort(e.target.value)}>
            <option value="desc">Más nuevos</option>
            <option value="asc">Más antiguos</option>
          </select>
          <label className="text-sm">Por página:</label>
          <select className="border rounded p-2" value={limit} onChange={(e)=>setLimit(Number(e.target.value))}>
            {[10,20,50,100].map(n => <option key={n} value={n}>{n}</option>)}
          </select>
        </div>
      </div>

      {/* Acciones masivas */}
      <div className="bg-white rounded-lg shadow p-4 mb-2 flex flex-wrap gap-2">
        <button onClick={()=>fetchLogs(page)} className="bg-gray-200 px-3 py-1 rounded hover:bg-gray-300">Actualizar</button>
        <button disabled={!selected.size} onClick={deleteSelected} className={`px-3 py-1 rounded ${selected.size ? 'bg-red-600 text-white hover:bg-red-700' : 'bg-gray-200 text-gray-500 cursor-not-allowed'}`}>
          Eliminar seleccionados ({selected.size})
        </button>
        <button onClick={deleteBefore} className="bg-orange-500 text-white px-3 py-1 rounded hover:bg-orange-600">Eliminar antes de fecha…</button>
        <button onClick={deleteRange}  className="bg-orange-500 text-white px-3 py-1 rounded hover:bg-orange-600">Eliminar por rango…</button>
        <button onClick={deleteAll}    className="bg-black text-white px-3 py-1 rounded hover:bg-gray-800">Eliminar TODO</button>

        <div className="ml-auto text-sm text-gray-600 self-center">
          Total: {meta.total.toLocaleString('es-CL')}
        </div>
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 text-left"><input type="checkbox" checked={allSelected} onChange={toggleAll} /></th>
              <th className="p-2 text-left">Usuario</th>
              <th className="p-2 text-left">Email</th>
              <th className="p-2 text-left">Rol</th>
              <th className="p-2 text-left">IP</th>
              <th className="p-2 text-left">Fecha</th>
              <th className="p-2 text-left">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {items.map(row => (
              <tr key={row._id} className="border-t">
                <td className="p-2">
                  <input
                    type="checkbox"
                    checked={selected.has(row._id)}
                    onChange={() => toggleRow(row._id)}
                  />
                </td>
                <td className="p-2">{row.name}</td>
                <td className="p-2">{row.email}</td>
                <td className="p-2">{row.role}</td>
                <td className="p-2">{row.ip || '-'}</td>
                <td className="p-2">{formatDate(row.createdAt)}</td>
                <td className="p-2">
                  <button
                    className="text-red-600 hover:underline"
                    onClick={async () => {
                      if (!window.confirm('¿Eliminar este log?')) return;
                      await apiFetch(`/api/logs/${row._id}`, { method: 'DELETE' });
                      fetchLogs(page);
                    }}
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr><td className="p-4 text-center text-gray-500" colSpan={7}>Sin registros</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      <div className="mt-3 flex items-center gap-2">
        <button disabled={page<=1} onClick={goPrev} className={`px-3 py-1 rounded ${page<=1?'bg-gray-200 text-gray-400':'bg-gray-100 hover:bg-gray-200'}`}>Anterior</button>
        <span className="text-sm">Página {meta.page} de {meta.pages}</span>
        <button disabled={page>=meta.pages} onClick={goNext} className={`px-3 py-1 rounded ${page>=meta.pages?'bg-gray-200 text-gray-400':'bg-gray-100 hover:bg-gray-200'}`}>Siguiente</button>
      </div>
    </div>
  );
}
