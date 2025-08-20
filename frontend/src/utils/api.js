// src/utils/api.js
const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

export async function apiFetch(path, { method = "GET", body, headers = {} } = {}) {
  const token = localStorage.getItem("authToken");
  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    body,
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data?.message || "Error en la solicitud");
  }
  return data;
}

// ================== USUARIOS ==================

// Listar todos los usuarios
export function getUsers() {
  return apiFetch("/api/users");
}

// Crear usuario
export function createUser(userData) {
  return apiFetch("/api/users/register", {
    method: "POST",
    body: JSON.stringify(userData),
  });
}

// Actualizar usuario
export function updateUser(id, userData) {
  return apiFetch(`/api/users/${id}`, {
    method: "PUT",
    body: JSON.stringify(userData),
  });
}

// Eliminar usuario
export function deleteUser(id) {
  return apiFetch(`/api/users/${id}`, {
    method: "DELETE",
  });
}

// Obtener usuarios frecuentes
export function getFrequentUsers() {
  return apiFetch("/api/users/frequent");
}

// ================== PEDIDOS ==================

// Listar todos los pedidos
export function getOrders() {
  return apiFetch("/api/orders");
}

// Obtener pedido por id
export function getOrderById(id) {
  return apiFetch(`/api/orders/${id}`);
}

// Crear pedido
export function createOrder(orderData) {
  return apiFetch("/api/orders", {
    method: "POST",
    body: JSON.stringify(orderData),
  });
}

// Actualizar estado del pedido
export function updateOrderStatus(id, status) {
  return apiFetch(`/api/orders/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}

// Eliminar pedido
export function deleteOrder(id) {
  return apiFetch(`/api/orders/${id}`, {
    method: "DELETE",
  });
}
