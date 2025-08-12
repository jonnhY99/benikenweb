// src/api/orders.js
const BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export async function fetchOrders() {
  const res = await fetch(`${BASE}/api/orders`);
  if (!res.ok) throw new Error('Error al obtener pedidos');
  return res.json();
}

export async function createOrder(payload) {
  const res = await fetch(`${BASE}/api/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Error al crear pedido');
  return res.json();
}

export async function updateOrderStatus(id, status) {
  const res = await fetch(`${BASE}/api/orders/${id}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });
  if (!res.ok) throw new Error('Error al actualizar estado');
  return res.json();
}

export async function deleteOrder(id) {
  const res = await fetch(`${BASE}/api/orders/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Error al eliminar pedido');
  return true;
}
