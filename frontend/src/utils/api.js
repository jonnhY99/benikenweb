// frontend/src/utils/api.js
export const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export async function apiFetch(path, options = {}) {
  const token = localStorage.getItem('token');

  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });

  if (!res.ok) {
    let data;
    try { data = await res.json(); } catch (_) {}
    const msg = data?.error || data?.message || `Error ${res.status}`;
    throw new Error(msg);
  }

  return res.json();
}

export default apiFetch;
