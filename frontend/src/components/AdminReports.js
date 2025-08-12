// src/components/AdminReports.js
import { useEffect, useMemo, useState } from "react";
import { getOrders } from "../utils/orders";

const toCLP = (n) =>
  (n ?? 0).toLocaleString("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  });

const two = (n) => String(n).padStart(2, "0");

export default function AdminReports() {
  const [orders, setOrders] = useState([]);
  const [range, setRange] = useState("hoy"); // hoy | semana | mes
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setErr("");
        const now = new Date();
        let from, to;
        if (range === "hoy") {
          const start = new Date(now);
          start.setHours(0, 0, 0, 0);
          const end = new Date(now);
          end.setHours(23, 59, 59, 999);
          from = start.toISOString();
          to = end.toISOString();
        } else if (range === "semana") {
          const start = new Date(now);
          start.setDate(now.getDate() - 6);
          start.setHours(0, 0, 0, 0);
          from = start.toISOString();
          to = now.toISOString();
        } else if (range === "mes") {
          const start = new Date(now.getFullYear(), now.getMonth(), 1);
          from = start.toISOString();
          to = now.toISOString();
        }
        const list = await getOrders({ from, to });
        setOrders(Array.isArray(list) ? list : list?.data ?? []);
      } catch (e) {
        setErr(e.message || "Error cargando reportes");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [range]);

  const stats = useMemo(() => {
    const s = {
      count: 0,
      revenue: 0,
      byStatus: {},
      byProduct: {},
      byHour: {}, // { '09:00': { count, revenue } }
      byDay: {}, // { 'YYYY-MM-DD': { count, revenue } }
    };

    for (const o of orders) {
      s.count += 1;

      // total del pedido (usa totalCLP si está, si no lo calcula)
      const orderTotal =
        o.totalCLP ??
        (o.items || []).reduce((acc, it) => {
          const price =
            it.pricePerKg ??
            it.price ??
            it.product?.pricePerKg ??
            0;
          const kg = it.kg ?? it.qty ?? 0;
          return acc + price * kg;
        }, 0);
      s.revenue += orderTotal;

      // estados
      const st = (o.status || "desconocido").toLowerCase();
      s.byStatus[st] = (s.byStatus[st] || 0) + 1;

      // top productos por kg
      for (const it of o.items || []) {
        const name = it.product?.name || it.name || "Producto";
        const kg = it.kg ?? it.qty ?? 0;
        s.byProduct[name] = (s.byProduct[name] || 0) + kg;
      }

      // series por hora/día (para ventas en el tiempo)
      const d = new Date(o.createdAt || Date.now());
      const hourKey = `${two(d.getHours())}:00`;
      const dayKey = `${d.getFullYear()}-${two(d.getMonth() + 1)}-${two(
        d.getDate()
      )}`;

      s.byHour[hourKey] = s.byHour[hourKey] || { count: 0, revenue: 0 };
      s.byHour[hourKey].count += 1;
      s.byHour[hourKey].revenue += orderTotal;

      s.byDay[dayKey] = s.byDay[dayKey] || { count: 0, revenue: 0 };
      s.byDay[dayKey].count += 1;
      s.byDay[dayKey].revenue += orderTotal;
    }

    // convertir a arrays ordenados para pintar
    s.seriesHour = Object.entries(s.byHour)
      .map(([label, v]) => ({ label, ...v }))
      .sort((a, b) => a.label.localeCompare(b.label));

    s.seriesDay = Object.entries(s.byDay)
      .map(([label, v]) => ({ label, ...v }))
      .sort((a, b) => a.label.localeCompare(b.label));

    return s;
  }, [orders]);

  const ticketAvg = stats.count ? stats.revenue / stats.count : 0;

  const topProducts = useMemo(() => {
    return Object.entries(stats.byProduct)
      .map(([name, kg]) => ({ name, kg }))
      .sort((a, b) => b.kg - a.kg)
      .slice(0, 10);
  }, [stats]);

  // serie a mostrar según rango
  const timeSeries = range === "hoy" ? stats.seriesHour : stats.seriesDay;
  const maxRev = Math.max(1, ...timeSeries.map((x) => x.revenue));

  const exportCSV = () => {
    const rows = [
      ["Código", "Fecha", "Estado", "Cliente", "TotalCLP"].join(","),
      ...orders.map((o) =>
        [
          o.code || o._id || "",
          new Date(o.createdAt || Date.now()).toLocaleString("es-CL"),
          o.status || "",
          o.customer?.name || o.customerName || "",
          o.totalCLP ?? 0,
        ].join(",")
      ),
    ].join("\n");

    const blob = new Blob([rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "reporte_pedidos.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <main className="container">
      <h1>Reportes</h1>

      <div className="card" style={{ marginBottom: 16 }}>
        <label>
          Rango:&nbsp;
          <select value={range} onChange={(e) => setRange(e.target.value)}>
            <option value="hoy">Hoy</option>
            <option value="semana">Últimos 7 días</option>
            <option value="mes">Mes actual</option>
          </select>
        </label>
        <button
          className="btn-secondary"
          style={{ marginLeft: 12 }}
          onClick={exportCSV}
        >
          Exportar CSV
        </button>
      </div>

      {loading && <p>Cargando…</p>}
      {err && <p style={{ color: "#b91c1c" }}>{err}</p>}

      {!loading && !err && (
        <>
          {/* KPIs */}
          <section className="grid">
            <div className="card">
              <h3>Pedidos</h3>
              <div style={{ fontSize: 28, fontWeight: 700 }}>{stats.count}</div>
            </div>
            <div className="card">
              <h3>Ingresos</h3>
              <div style={{ fontSize: 28, fontWeight: 700 }}>
                {toCLP(stats.revenue)}
              </div>
            </div>
            <div className="card">
              <h3>Ticket promedio</h3>
              <div style={{ fontSize: 28, fontWeight: 700 }}>
                {toCLP(ticketAvg)}
              </div>
            </div>
            <div className="card">
              <h3>Estados</h3>
              <ul style={{ margin: 0, paddingLeft: 16 }}>
                {Object.entries(stats.byStatus).map(([k, v]) => (
                  <li key={k}>
                    <strong>{k}:</strong> {v}
                  </li>
                ))}
                {!Object.keys(stats.byStatus).length && (
                  <li>Sin pedidos en el rango.</li>
                )}
              </ul>
            </div>
          </section>

          {/* Serie temporal: por hora o por día */}
          <section className="card" style={{ marginTop: 16 }}>
            <h3>
              Ventas por {range === "hoy" ? "hora" : "día"} (pedidos e ingresos)
            </h3>
            <table width="100%">
              <thead>
                <tr>
                  <th align="left">{range === "hoy" ? "Hora" : "Día"}</th>
                  <th align="right">Pedidos</th>
                  <th align="right">Ingresos</th>
                  <th align="left">Gráfico</th>
                </tr>
              </thead>
              <tbody>
                {timeSeries.map((x) => (
                  <tr key={x.label}>
                    <td>{x.label}</td>
                    <td align="right">{x.count}</td>
                    <td align="right">{toCLP(x.revenue)}</td>
                    <td>
                      <div
                        style={{
                          background: "#eee",
                          borderRadius: 6,
                          height: 10,
                          width: "100%",
                        }}
                      >
                        <div
                          style={{
                            height: 10,
                            width: `${(x.revenue / maxRev) * 100}%`,
                            background: "#b91c1c",
                            borderRadius: 6,
                          }}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
                {!timeSeries.length && (
                  <tr>
                    <td colSpan="4">Sin datos en el rango seleccionado.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </section>

          {/* Top productos */}
          <section className="card" style={{ marginTop: 16 }}>
            <h3>Top productos por kg</h3>
            <table width="100%">
              <thead>
                <tr>
                  <th align="left">Producto</th>
                  <th align="right">Kg vendidos</th>
                </tr>
              </thead>
              <tbody>
                {topProducts.map((p) => (
                  <tr key={p.name}>
                    <td>{p.name}</td>
                    <td align="right">
                      {p.kg.toLocaleString("es-CL")}
                    </td>
                  </tr>
                ))}
                {!topProducts.length && (
                  <tr>
                    <td colSpan="2">Sin datos en el rango.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </section>
        </>
      )}
    </main>
  );
}
