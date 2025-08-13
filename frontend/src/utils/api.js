// frontend/src/utils/api.js
const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000';

/** Obtiene el token desde localStorage (soporta "token" y "authToken") */
export function getToken() {
  return (
    localStorage.getItem('token') ||
    localStorage.getItem('authToken') || // compatibilidad con versiones previas
    ''
  );
}

/** Helper para llamadas autenticadas */
export async function apiFetch(path, { method = 'GET', body, headers = {}, token } = {}) {
  const t = token ?? getToken();
  if (!t) throw new Error('Token requerido');

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${t}`,
      ...headers,
    },
    body,
  });

  let data;
  try {
    data = await res.json();
  } catch {
    data = null;
  }

  if (!res.ok) {
    const msg = (data && (data.message || data.error)) || `HTTP ${res.status}`;
    throw new Error(msg);
  }

  return data;
}
