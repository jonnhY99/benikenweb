import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchOrderById } from "../api/orders";
import { getSocket } from "../utils/socket";

export default function OrderTrackerBanner() {
  const [trackingId, setTrackingId] = useState(localStorage.getItem("trackingOrderId"));
  const [status, setStatus] = useState("");
  const [hidden, setHidden] = useState(false);
  const [visible, setVisible] = useState(false); // 👈 para animación
  const navigate = useNavigate();

  // ✅ Cargar estado inicial del pedido
  useEffect(() => {
    if (!trackingId) return;

    const load = async () => {
      try {
        const order = await fetchOrderById(trackingId);
        setStatus(order.status);

        if (order.status === "Entregado") {
          localStorage.removeItem("trackingOrderId");
          setTrackingId(null);
          setHidden(true);
        } else {
          setVisible(true);
        }
      } catch (err) {
        console.error("Error consultando pedido:", err);
        localStorage.removeItem("trackingOrderId");
        setTrackingId(null);
      }
    };

    load();
  }, [trackingId]);

  // ✅ Escuchar cambios en tiempo real con socket
  useEffect(() => {
    const s = getSocket();
    if (!s || !trackingId) return;

    const onUpdated = (updated) => {
      if (updated?.id === trackingId || updated?._id === trackingId) {
        setStatus(updated.status);

        if (updated.status === "Entregado") {
          localStorage.removeItem("trackingOrderId");
          setTrackingId(null);
          setHidden(true);
          setVisible(false);
        }
      }
    };

    s.on("orders:updated", onUpdated);
    return () => {
      s.off("orders:updated", onUpdated);
    };
  }, [trackingId]);

  // ✅ Si no hay pedido que seguir, no renderizar nada
  if (!trackingId || hidden) return null;

  return (
    <div
      className={`bg-yellow-400 text-black font-semibold text-center py-2 cursor-pointer transition-all duration-500 ease-in-out transform
        ${visible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"}
      `}
      onClick={() => navigate(`/order-status`)}
    >
      🔔 Siguiendo el pedido <strong>#{trackingId}</strong>{" "}
      <span className="italic">({status || "consultando..."})</span>
    </div>
  );
}
