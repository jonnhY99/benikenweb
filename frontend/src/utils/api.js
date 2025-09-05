// src/utils/api.js
const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

export async function apiFetch(path, { method = "GET", body, headers = {} } = {}) {
  // Buscar token en múltiples ubicaciones
  const authToken = localStorage.getItem("authToken");
  const token = localStorage.getItem("token");
  const finalToken = authToken || token;
  
  console.log('🔍 API Request:', method, `${API_URL}${path}`);
  console.log('🔍 authToken present:', !!authToken);
  console.log('🔍 token present:', !!token);
  console.log('🔍 Final token used:', !!finalToken);
  if (finalToken) {
    console.log('🔍 Token preview:', finalToken.substring(0, 20) + '...');
  }
  
  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(finalToken ? { Authorization: `Bearer ${finalToken}` } : {}),
      ...headers,
    },
    body,
  });

  console.log('🔍 API Response status:', res.status, res.statusText);
  
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    console.error('❌ API Error:', res.status, data);
    console.error('❌ Request headers sent:', {
      'Content-Type': 'application/json',
      ...(finalToken ? { Authorization: `Bearer ${finalToken.substring(0, 20)}...` } : {}),
    });
    throw new Error(data?.message || `Error ${res.status}: ${res.statusText}`);
  }
  
  console.log('✅ API Success:', data);
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
