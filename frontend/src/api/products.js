// src/api/products.js
const BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export async function fetchProducts() {
  const res = await fetch(`${BASE}/api/products`);
  if (!res.ok) throw new Error('Error al obtener productos');
  return res.json();
}

export async function createProduct(payload) {
  const res = await fetch(`${BASE}/api/products`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Error al crear producto');
  return res.json();
}

export async function patchProduct(id, payload) {
  const res = await fetch(`${BASE}/api/products/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Error al actualizar producto');
  return res.json();
}
