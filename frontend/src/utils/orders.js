// src/utils/orders.js

// Semilla de pedidos para ambiente local (con createdAt)
export const orders = [
  {
    id: 'ORD001',
    customerName: 'Juan Pérez',
    customerPhone: '5512345678',
    pickupTime: '10:00 AM',
    status: 'Pendiente',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // hace 2h
    items: [
      { productId: '1', name: 'Tocino',        quantity: 1, unit: 'kg',    price: 1698 },
      { productId: '2', name: 'Huesitos',      quantity: 1, unit: 'kg',    price:  698 },
    ],
    total: 2396,
  },
  {
    id: 'ORD002',
    customerName: 'María García',
    customerPhone: '5587654321',
    pickupTime: '02:00 PM',
    status: 'Completado',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 26).toISOString(), // ayer
    items: [
      { productId: '3', name: 'Costillas de Cerdo', quantity: 1, unit: 'kg', price: 6298 },
    ],
    total: 6298,
  },
];

/**
 * getOrders: devuelve pedidos desde localStorage (clave 'orders') o desde la semilla.
 * Normaliza estructura para ser compatible con AdminReports:
 * - createdAt (ISO)
 * - items[].qty / items[].kg
 * - items[].pricePerKg
 * - totalCLP
 * Permite filtrar por rango { from, to } en ISO.
 */
export async function getOrders({ from, to } = {}) {
  let data;
  try {
    const raw = localStorage.getItem('orders');
    data = raw ? JSON.parse(raw) : orders;
  } catch {
    data = orders;
  }

  const nowIso = new Date().toISOString();

  const norm = (data || []).map((o) => {
    const createdAt = o.createdAt || nowIso;

    const items = (o.items || []).map((it) => ({
      ...it,
      qty: it.qty ?? it.quantity ?? 0,                                  // compat
      kg: it.kg ?? (it.unit === 'kg' ? (it.quantity ?? 0) : undefined), // compat
      pricePerKg: it.pricePerKg ?? it.price ?? 0,                       // compat
      product: it.product || { name: it.name, pricePerKg: it.price },   // compat
    }));

    const totalCLP =
      typeof o.totalCLP === 'number'
        ? o.totalCLP
        : typeof o.total === 'number'
        ? o.total
        : items.reduce(
            (s, it) => s + (it.pricePerKg ?? 0) * (it.kg ?? it.qty ?? 0),
            0
          );

    return { ...o, createdAt, items, totalCLP };
  });

  const start = from ? Date.parse(from) : null;
  const end = to ? Date.parse(to) : null;

  const filtered = norm.filter((o) => {
    const t = Date.parse(o.createdAt);
    return (start == null || t >= start) && (end == null || t <= end);
  });

  // simulamos async
  return Promise.resolve(filtered);
}
