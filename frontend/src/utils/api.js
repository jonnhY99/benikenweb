const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export async function apiFetch(path, { method = 'GET', body, headers = {} } = {}) {
  const token = localStorage.getItem('authToken');
  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    body,
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data?.message || 'Error en la solicitud');
  }
  return data;
}
