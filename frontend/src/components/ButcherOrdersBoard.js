import React, { useMemo, useState } from "react";
import OrderReviewModal from "./OrderReviewModal"; // 👈 Importar modal

const toCLP = (n) =>
  (n ?? 0).toLocaleString("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  });

function norm(s) {
  return String(s || "").toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, "");
}

function matchesOrder(o, q) {
  if (!q) return true;
  const hay = (v) => norm(v).includes(q);
  return (
    hay(o.id) ||
    hay(o.customerName) ||
    hay(o.customerPhone) ||
    hay(o.pickupTime) ||
    (o.items || []).some((it) => hay(it.name))
  );
}

// ── Tramos horarios (ajustables)
const HOUR_BUCKETS = [
  { id: "all", label: "Todas las horas" },
  { id: "09-12", label: "09:00 – 12:00", start: 9, end: 12 },
  { id: "12-15", label: "12:00 – 15:00", start: 12, end: 15 },
  { id: "15-18", label: "15:00 – 18:00", start: 15, end: 18 },
  { id: "18-21", label: "18:00 – 21:00", start: 18, end: 21 },
];

function parseHourFromPickup(pickupTime) {
  if (!pickupTime) return null;
  const s = String(pickupTime).trim();
  const m12 = s.match(/^(\d{1,2}):?(\d{2})?\s*(AM|PM)$/i);
  if (m12) {
    let h = parseInt(m12[1], 10);
    const ampm = m12[3].toUpperCase();
    if (ampm === "AM") h = h === 12 ? 0 : h;
    else h = h === 12 ? 12 : h + 12;
    return isNaN(h) ? null : h;
  }
  const m24 = s.match(/^(\d{1,2}):(\d{2})$/);
  if (m24) return isNaN(+m24[1]) ? null : +m24[1];
  const onlyH = s.match(/^(\d{1,2})$/);
  if (onlyH) return isNaN(+onlyH[1]) ? null : +onlyH[1];
  return null;
}

function inHourBucket(hour, bucketId) {
  if (bucketId === "all") return true;
  if (hour == null) return false;
  const b = HOUR_BUCKETS.find((x) => x.id === bucketId);
  if (!b || b.start == null) return true;
  return hour >= b.start && hour < b.end; // start ≤ h < end
}

function inDateRange(createdAt, startISO, endISO) {
  if (!startISO && !endISO) return true;
  const t = Date.parse(createdAt || "");
  if (isNaN(t)) return false;
  if (startISO) {
    const start = new Date(startISO + "T00:00:00.000");
    if (t < +start) return false;
  }
  if (endISO) {
    const end = new Date(endISO + "T23:59:59.999");
    if (t > +end) return false;
  }
  return true;
}

// 🔹 Normaliza los estados para que siempre se muestren bien
function normalizeStatus(status) {
  if (!status) return "Pendiente";
  const s = status.toLowerCase();
  if (s.includes("pendiente")) return "Pendiente";
  if (s.includes("preparacion")) return "En preparación";
  if (s.includes("listo")) return "Listo";
  if (s.includes("entregado")) return "Entregado";
  return status;
}

function OrderCard({ order, onUpdate, onDelete }) {
  const [showModal, setShowModal] = useState(false); // 👈 controlar modal

  const total =
    typeof order.totalCLP === "number"
      ? order.totalCLP
      : order.total ??
        (order.items || []).reduce(
          (s, it) => s + (it.price ?? 0) * (it.quantity ?? 0),
          0
        );

  const status = normalizeStatus(order.status);

  // 🔹 Guardar cambios desde el modal
  const handleSave = (updatedItems) => {
    const newTotal = updatedItems.reduce(
      (s, it) => s + (it.price ?? 0) * (it.quantity ?? 0),
      0
    );
    onUpdate(order.id, "Listo", updatedItems, newTotal); // 👈 pasamos items y total
    setShowModal(false);
  };

  return (
    <div className="bg-white rounded-lg shadow p-4 border">
      <div className="flex items-center justify-between">
        <h4 className="font-semibold">#{order.id}</h4>
        <span
          className={`text-xs px-2 py-1 rounded ${
            status === "Pendiente" || status === "En preparación"
              ? "bg-yellow-100 text-yellow-800"
              : status === "Listo"
              ? "bg-blue-100 text-blue-800"
              : "bg-green-100 text-green-800"
          }`}
        >
          {status}
        </span>
      </div>

      <div className="text-sm text-gray-600 mt-1">
        <div className="truncate">
          <strong>Cliente:</strong> {order.customerName}
        </div>
        <div>
          <strong>Retiro:</strong> {order.pickupTime}
        </div>
        <div>
          <strong>Total:</strong> {toCLP(total)}
        </div>
      </div>

      <ul className="text-sm text-gray-700 mt-2 list-disc ml-5">
        {(order.items || []).map((it, idx) => (
          <li key={idx}>
            {it.name} — {it.quantity} {it.unit || "kg"}
          </li>
        ))}
      </ul>

      <div className="flex flex-wrap gap-2 mt-3">
        {(status === "Pendiente" || status === "En preparación") && (
          <button
            className="px-3 py-1 rounded bg-blue-600 text-white hover:bg-blue-700"
            onClick={() => setShowModal(true)} // 👈 abrir modal
          >
            Ajustar y Marcar LISTO
          </button>
        )}
        {status === "Listo" && (
          <>
            <button
              className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300"
              onClick={() => onUpdate(order.id, "Pendiente")}
            >
              Volver a En preparación
            </button>
            <button
              className="px-3 py-1 rounded bg-green-600 text-white hover:bg-green-700"
              onClick={() => onUpdate(order.id, "Entregado")}
            >
              Marcar ENTREGADO
            </button>
          </>
        )}
        {status === "Entregado" && (
          <span className="text-xs text-gray-500">
            Entregado (solo historial)
          </span>
        )}

        {onDelete && (
          <button
            className="ml-auto px-3 py-1 rounded bg-red-600 text-white hover:bg-red-700"
            onClick={() => onDelete(order.id)}
            aria-label={`Eliminar pedido ${order.id}`}
            title="Eliminar pedido"
          >
            Eliminar
          </button>
        )}
      </div>

      {/* 🔹 Modal de ajuste */}
      {showModal && (
        <OrderReviewModal
          order={order}
          onSave={handleSave}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
}

/**
 * Tablero de pedidos para carnicería.
 * - Busca por id, cliente, teléfono, producto, hora de retiro.
 * - Filtros: rango de fechas (createdAt) y tramo horario (pickupTime).
 * - Eliminar pedidos (carnicería y admin).
 * - Mostrar/ocultar Entregados (solo admin).
 */
export default function ButcherOrdersBoard({
  orders,
  onUpdateStatus,
  onDeleteOrder,
  isAdmin = false,
}) {
  const [showDelivered, setShowDelivered] = useState(false);
  const [query, setQuery] = useState("");
  const [hourBucket, setHourBucket] = useState("all");
  const [dateStart, setDateStart] = useState("");
  const [dateEnd, setDateEnd] = useState("");

  const q = norm(query.trim());

  const { filteredCount, totalCount, pending, ready, delivered } = useMemo(() => {
    const total = (orders || []).length;

    const filtered = (orders || []).filter((o) => {
      if (!matchesOrder(o, q)) return false;
      if (!inDateRange(o.createdAt, dateStart, dateEnd)) return false;
      if (hourBucket !== "all") {
        const hour = parseHourFromPickup(o.pickupTime);
        if (!inHourBucket(hour, hourBucket)) return false;
      }
      return true;
    });

    const p = [];
    const r = [];
    const d = [];
    for (const o of filtered) {
      const status = normalizeStatus(o.status);
      if (status === "Entregado") d.push(o);
      else if (status === "Listo") r.push(o);
      else p.push(o);
    }
    const sortFn = (a, b) =>
      new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
    return {
      totalCount: total,
      filteredCount: filtered.length,
      pending: p.sort(sortFn),
      ready: r.sort(sortFn),
      delivered: d.sort(sortFn),
    };
  }, [orders, q, hourBucket, dateStart, dateEnd]);

  const clearFilters = () => {
    setQuery("");
    setHourBucket("all");
    setDateStart("");
    setDateEnd("");
  };

  const confirmDelete = (orderId) => {
    if (window.confirm(`¿Eliminar el pedido ${orderId}? Esta acción es permanente.`)) {
      onDeleteOrder?.(orderId);
    }
  };



  return (
    <section>
      {/* Barra superior */}
      <div className="flex flex-col gap-3 mb-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <h2 className="text-3xl font-bold">Panel de Pedidos — Carnicería</h2>

          {/* Buscador */}
          <div className="flex-1 md:max-w-xl">
            <label className="w-full flex items-center gap-2 bg-white rounded-lg border px-3 py-2 shadow-sm">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-gray-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-4.35-4.35M10 18a8 8 0 100-16 8 8 0 000 16z" />
              </svg>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar por cliente, código, producto o teléfono…"
                className="flex-1 outline-none text-sm"
                aria-label="Buscar pedidos"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  className="text-gray-500 hover:text-gray-700 text-sm"
                  aria-label="Limpiar búsqueda"
                >
                  ✕
                </button>
              )}
            </label>
            <p className="text-xs text-gray-500 mt-1">
              Mostrando {filteredCount} de {totalCount} pedidos.
            </p>
          </div>

          {/* Toggle entregados */}
          {isAdmin && (
            <label className="text-sm flex items-center gap-2">
              <input
                type="checkbox"
                checked={showDelivered}
                onChange={(e) => setShowDelivered(e.target.checked)}
              />
              Mostrar entregados (historial)
            </label>
          )}
        </div>

        {/* Filtros */}
        <div className="flex flex-col md:flex-row gap-3 md:items-center">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-700">Tramo horario:</span>
            <select
              value={hourBucket}
              onChange={(e) => setHourBucket(e.target.value)}
              className="bg-white border rounded px-2 py-1 text-sm"
            >
              {HOUR_BUCKETS.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-700">Desde:</span>
            <input
              type="date"
              value={dateStart}
              onChange={(e) => setDateStart(e.target.value)}
              className="bg-white border rounded px-2 py-1 text-sm"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-700">Hasta:</span>
            <input
              type="date"
              value={dateEnd}
              onChange={(e) => setDateEnd(e.target.value)}
              className="bg-white border rounded px-2 py-1 text-sm"
            />
          </div>

          <div className="flex-1" />
          <button
            type="button"
            onClick={clearFilters}
            className="self-start md:self-auto px-3 py-2 text-sm rounded bg-gray-200 hover:bg-gray-300"
          >
            Limpiar filtros
          </button>
        </div>
      </div>

      <div
        className={`grid gap-6 ${
          showDelivered && isAdmin
            ? "grid-cols-1 md:grid-cols-3"
            : "grid-cols-1 md:grid-cols-2"
        }`}
      >
        {/* Pendientes */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xl font-semibold">Pendientes</h3>
            <span className="text-sm text-gray-600">{pending.length} pedidos</span>
          </div>
          <div className="space-y-4">
            {pending.length ? (
              pending.map((o) => (
                <OrderCard
                  key={o.id}
                  order={o}
                  onUpdate={onUpdateStatus}
                  onDelete={confirmDelete}
                />
              ))
            ) : (
              <div className="text-gray-500">
                {query || dateStart || dateEnd || hourBucket !== "all"
                  ? "Sin coincidencias."
                  : "No hay pedidos pendientes."}
              </div>
            )}
          </div>
        </div>

        {/* Listos */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xl font-semibold">Listos para Retiro</h3>
            <span className="text-sm text-gray-600">{ready.length} pedidos</span>
          </div>
          <div className="space-y-4">
            {ready.length ? (
              ready.map((o) => (
                <OrderCard
                  key={o.id}
                  order={o}
                  onUpdate={onUpdateStatus}
                  onDelete={confirmDelete}
                />
              ))
            ) : (
              <div className="text-gray-500">
                {query || dateStart || dateEnd || hourBucket !== "all"
                  ? "Sin coincidencias."
                  : "Aún no hay pedidos listos."}
              </div>
            )}
          </div>
        </div>

        {/* Entregados */}
        {isAdmin && showDelivered && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xl font-semibold">Entregados (Historial)</h3>
              <span className="text-sm text-gray-600">{delivered.length} pedidos</span>
            </div>
            <div className="space-y-4">
              {delivered.length ? (
                delivered.map((o) => (
                  <OrderCard
                    key={o.id}
                    order={o}
                    onUpdate={onUpdateStatus}
                    onDelete={confirmDelete}
                  />
                ))
              ) : (
                <div className="text-gray-500">
                  {query || dateStart || dateEnd || hourBucket !== "all"
                    ? "Sin coincidencias."
                    : "Sin entregados en el rango."}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <p className="mt-6 text-sm text-gray-500">
        * Usa el buscador y los filtros para encontrar pedidos; puedes{" "}
        <strong>eliminar</strong> pedidos rechazados desde los botones rojos.
      </p>
    </section>
  );
}
