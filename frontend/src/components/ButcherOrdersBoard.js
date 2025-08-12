// src/components/ButcherOrdersBoard.js
import React, { useMemo } from "react";

const toCLP = (n) =>
  (n ?? 0).toLocaleString("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  });

function OrderCard({ order, onUpdate }) {
  const total =
    typeof order.totalCLP === "number"
      ? order.totalCLP
      : order.total ??
        (order.items || []).reduce((s, it) => s + (it.price ?? 0) * (it.quantity ?? 0), 0);

  return (
    <div className="bg-white rounded-lg shadow p-4 border">
      <div className="flex items-center justify-between">
        <h4 className="font-semibold">#{order.id}</h4>
        <span
          className={`text-xs px-2 py-1 rounded ${
            order.status === "Pendiente"
              ? "bg-yellow-100 text-yellow-800"
              : order.status === "Listo"
              ? "bg-blue-100 text-blue-800"
              : "bg-green-100 text-green-800"
          }`}
        >
          {order.status}
        </span>
      </div>

      <div className="text-sm text-gray-600 mt-1">
        <div className="truncate"><strong>Cliente:</strong> {order.customerName}</div>
        <div><strong>Retiro:</strong> {order.pickupTime}</div>
        <div><strong>Total:</strong> {toCLP(total)}</div>
      </div>

      <ul className="text-sm text-gray-700 mt-2 list-disc ml-5">
        {(order.items || []).map((it, idx) => (
          <li key={idx}>{it.name} — {it.quantity} {it.unit || "kg"}</li>
        ))}
      </ul>

      <div className="flex gap-2 mt-3">
        {order.status === "Pendiente" && (
          <button
            className="px-3 py-1 rounded bg-blue-600 text-white hover:bg-blue-700"
            onClick={() => onUpdate(order.id, "Listo")}
          >
            Marcar LISTO
          </button>
        )}
        {order.status === "Listo" && (
          <>
            <button
              className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300"
              onClick={() => onUpdate(order.id, "Pendiente")}
            >
              Volver a Pendiente
            </button>
            <button
              className="px-3 py-1 rounded bg-green-600 text-white hover:bg-green-700"
              onClick={() => onUpdate(order.id, "Entregado")}
            >
              Marcar ENTREGADO
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default function ButcherOrdersBoard({ orders, onUpdateStatus }) {
  // Excluir entregados del tablero
  const { pending, ready } = useMemo(() => {
    const p = [];
    const r = [];
    for (const o of orders || []) {
      if (o.status === "Entregado") continue;
      if (o.status === "Listo") r.push(o);
      else p.push(o); // default Pendiente / otros
    }
    // ordenar por fecha (más nuevos arriba)
    const sortFn = (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
    return { pending: p.sort(sortFn), ready: r.sort(sortFn) };
  }, [orders]);

  return (
    <section>
      <h2 className="text-3xl font-bold mb-6 text-center">Panel de Pedidos — Carnicería</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Columna Pendientes */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xl font-semibold">Pendientes</h3>
            <span className="text-sm text-gray-600">{pending.length} pedidos</span>
          </div>
          <div className="space-y-4">
            {pending.length ? (
              pending.map((o) => (
                <OrderCard key={o.id} order={o} onUpdate={onUpdateStatus} />
              ))
            ) : (
              <div className="text-gray-500">No hay pedidos pendientes.</div>
            )}
          </div>
        </div>

        {/* Columna Listos */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xl font-semibold">Listos para Retiro</h3>
            <span className="text-sm text-gray-600">{ready.length} pedidos</span>
          </div>
          <div className="space-y-4">
            {ready.length ? (
              ready.map((o) => (
                <OrderCard key={o.id} order={o} onUpdate={onUpdateStatus} />
              ))
            ) : (
              <div className="text-gray-500">Aún no hay pedidos listos.</div>
            )}
          </div>
        </div>
      </div>

      <p className="mt-6 text-sm text-gray-500">
        * Los pedidos <strong>Entregados</strong> se ocultan de este panel automáticamente (quedan en el
        historial/administración).
      </p>
    </section>
  );
}
