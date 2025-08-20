// src/api/orders.js
const BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// 📌 Obtener todos los pedidos
export async function fetchOrders() {
  const res = await fetch(`${BASE}/api/orders`);
  if (!res.ok) throw new Error('Error al obtener pedidos');
  return res.json();
}

// 📌 Obtener un pedido por ID
export async function fetchOrderById(id) {
  const res = await fetch(`${BASE}/api/orders/${id}`);
  if (!res.ok) throw new Error('Error al obtener el pedido');
  return res.json();
}

// 📌 Crear un nuevo pedido
export async function createOrder(payload) {
  const res = await fetch(`${BASE}/api/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Error al crear pedido');
  return res.json();
}

// 📌 Actualizar estado de un pedido
export async function updateOrderStatus(id, status) {
  const res = await fetch(`${BASE}/api/orders/${id}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });
  if (!res.ok) throw new Error('Error al actualizar estado');
  return res.json();
}

// 📌 Marcar un pedido como pagado
export async function payOrder(id) {
  const res = await fetch(`${BASE}/api/orders/${id}/pay`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
  });
  if (!res.ok) throw new Error('Error al marcar pedido como pagado');
  return res.json();
}

// 📌 Eliminar un pedido
export async function deleteOrder(id) {
  const res = await fetch(`${BASE}/api/orders/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Error al eliminar pedido');
  return true;
}

// 📌 🔹 Nueva: Ajustar pedido (review)
export async function updateOrderReview(id, items) {
  const { data } = await axios.patch(`${API_URL}/${id}/review`, { items });
  return data;
}