// backend/routes/orders.js
import express from "express";
import Order from "../models/Order.js";
import Product from "../models/Product.js";

export default function ordersRouterFactory(io) {
  const router = express.Router();

  // ─── Generar el próximo id de pedido (ORD001, ORD002, etc.)
  async function getNextOrderId() {
    const last = await Order.find().sort({ createdAt: -1 }).limit(1);
    let next = 1;
    if (last[0]?.id) {
      const n = parseInt(String(last[0].id).replace(/\D/g, ""), 10);
      if (!isNaN(n)) next = n + 1;
    }
    return `ORD${String(next).padStart(3, "0")}`;
  }

  // ─── Normalizador de estados
  function normalizeStatus(status) {
    if (!status) return "En preparación";
    const s = status.toLowerCase();
    if (s.includes("prep")) return "En preparación";
    if (s.includes("listo")) return "Listo";
    if (s.includes("entreg")) return "Entregado";
    return status; // fallback
  }

  // 📌 GET todos (carnicería / admin)
  router.get("/", async (_req, res) => {
    try {
      const orders = await Order.find().sort({ createdAt: -1 });
      res.json(orders);
    } catch (err) {
      console.error("❌ Error GET /orders:", err);
      res.status(500).json({ error: "Error al obtener pedidos" });
    }
  });

  // 📌 GET por id (público para tracking)
  router.get("/:id", async (req, res) => {
    try {
      const q = req.params.id;
      let order = await Order.findOne({ id: q });
      if (!order && q.match(/^[0-9a-fA-F]{24}$/)) {
        order = await Order.findById(q);
      }
      if (!order) return res.status(404).json({ error: "Pedido no encontrado" });
      res.json(order);
    } catch (err) {
      console.error("❌ Error GET /orders/:id:", err);
      res.status(500).json({ error: "Error consultando pedido" });
    }
  });

  // 📌 Crear pedido
  router.post("/", async (req, res) => {
    try {
      const {
        customerName,
        customerPhone,
        customerEmail,
        note = "",
        pickupTime,
        status = "En preparación",
        totalCLP,
        items,
      } = req.body;

      if (!items?.length) {
        return res.status(400).json({ error: "El pedido no contiene ítems" });
      }

      const id = req.body.id || (await getNextOrderId());

      // Descontar stock
      const ops = items.map((it) => ({
        updateOne: {
          filter: { id: it.productId, stock: { $gte: it.quantity } },
          update: { $inc: { stock: -it.quantity } },
        },
      }));

      const bulk = await Product.bulkWrite(ops, { ordered: true });
      const modified = bulk.modifiedCount ?? bulk.nModified ?? 0;
      if (modified !== items.length) {
        return res
          .status(409)
          .json({ error: "Stock insuficiente en uno o más productos" });
      }

      // Crear pedido
      const order = await Order.create({
        id,
        customerName,
        customerPhone,
        customerEmail,
        note,
        pickupTime,
        status: normalizeStatus(status),
        totalCLP,
        items,
        paid: false, // 👈 inicializa en no pagado
        paymentDate: null,
      });

      // Emitir eventos
      const ids = items.map((i) => i.productId);
      const updatedProducts = await Product.find({ id: { $in: ids } });
      io.emit("products:updated", updatedProducts);
      io.emit("orders:created", order);

      res.status(201).json(order);
    } catch (err) {
      console.error("❌ Error POST /orders:", err);
      res.status(400).json({ error: "No se pudo crear el pedido" });
    }
  });
  // 📌 Revisar/Ajustar pedido
router.patch("/:id/review", async (req, res) => {
  try {
    const q = req.params.id;
    const updatedItems = req.body.items;

    if (!Array.isArray(updatedItems) || !updatedItems.length) {
      return res.status(400).json({ error: "Items inválidos" });
    }

    // recalcular total
    const newTotal = updatedItems.reduce(
      (sum, it) => sum + (it.price || 0) * (it.quantity || 0),
      0
    );

    let order = await Order.findOneAndUpdate(
      { id: q },
      { items: updatedItems, totalCLP: newTotal, reviewed: true },
      { new: true }
    );
    if (!order && q.match(/^[0-9a-fA-F]{24}$/)) {
      order = await Order.findByIdAndUpdate(
        q,
        { items: updatedItems, totalCLP: newTotal, reviewed: true },
        { new: true }
      );
    }

    if (!order) return res.status(404).json({ error: "Pedido no encontrado" });

    io.emit("orders:updated", order);
    res.json(order);
  } catch (err) {
    console.error("❌ Error PATCH /orders/:id/review:", err);
    res.status(400).json({ error: "No se pudo ajustar el pedido" });
  }
});

  // 📌 Confirmar pesos exactos del carnicero y marcar como listo
  router.patch("/:id/confirm-weights", async (req, res) => {
    try {
      const q = req.params.id;
      const updatedItems = req.body.items;

      if (!Array.isArray(updatedItems) || !updatedItems.length) {
        return res.status(400).json({ error: "Items inválidos" });
      }

      // recalcular total con pesos exactos
      const newTotal = updatedItems.reduce(
        (sum, it) => sum + (it.price || 0) * (it.quantity || 0),
        0
      );

      let order = await Order.findOneAndUpdate(
        { id: q },
        { 
          items: updatedItems, 
          totalCLP: newTotal, 
          reviewed: true,
          status: "Listo" // Marcar automáticamente como listo
        },
        { new: true }
      );
      if (!order && q.match(/^[0-9a-fA-F]{24}$/)) {
        order = await Order.findByIdAndUpdate(
          q,
          { 
            items: updatedItems, 
            totalCLP: newTotal, 
            reviewed: true,
            status: "Listo"
          },
          { new: true }
        );
      }

      if (!order) return res.status(404).json({ error: "Pedido no encontrado" });

      // Emitir eventos específicos para actualizaciones del carnicero
      io.emit("orders:updated", order);
      io.emit("butcher:order:updated", {
        orderId: order.id,
        items: updatedItems,
        newTotal: newTotal,
        status: "Listo"
      });

      res.json(order);
    } catch (err) {
      console.error("❌ Error PATCH /orders/:id/confirm-weights:", err);
      res.status(400).json({ error: "No se pudo confirmar los pesos" });
    }
  });

  // 📌 Actualizar estado
  router.patch("/:id/status", async (req, res) => {
    try {
      const q = req.params.id;
      const status = normalizeStatus(req.body.status);

      let order = await Order.findOneAndUpdate(
        { id: q },
        { status },
        { new: true }
      );
      if (!order && q.match(/^[0-9a-fA-F]{24}$/)) {
        order = await Order.findByIdAndUpdate(q, { status }, { new: true });
      }

      if (!order) return res.status(404).json({ error: "Pedido no encontrado" });

      io.emit("orders:updated", order);
      res.json(order);
    } catch (err) {
      console.error("❌ Error PATCH /orders/:id/status:", err);
      res.status(400).json({ error: "No se pudo actualizar el estado" });
    }
  });

// 📌 Marcar pedido como pagado
router.patch("/:id/pay", async (req, res) => {
  try {
    const q = req.params.id;
    const update = { paid: true, paymentDate: new Date() };

    let order = await Order.findOneAndUpdate({ id: q }, update, { new: true });
    if (!order && q.match(/^[0-9a-fA-F]{24}$/)) {
      order = await Order.findByIdAndUpdate(q, update, { new: true });
    }

    if (!order) return res.status(404).json({ error: "Pedido no encontrado" });

    io.emit("orders:updated", order);
    res.json(order);
  } catch (err) {
    console.error("❌ Error PATCH /orders/:id/pay:", err);
    res.status(400).json({ error: "No se pudo marcar el pedido como pagado" });
  }
});


  // 📌 Eliminar pedido (repone stock)
  router.delete("/:id", async (req, res) => {
    try {
      const q = req.params.id;
      let order = await Order.findOneAndDelete({ id: q });
      if (!order && q.match(/^[0-9a-fA-F]{24}$/)) {
        order = await Order.findByIdAndDelete(q);
      }

      if (!order) return res.status(404).json({ error: "Pedido no encontrado" });

      // Reponer stock
      if (order.items?.length) {
        const ops = order.items.map((it) => ({
          updateOne: {
            filter: { id: it.productId },
            update: { $inc: { stock: it.quantity } },
          },
        }));
        await Product.bulkWrite(ops, { ordered: true });

        const ids = order.items.map((i) => i.productId);
        const updatedProducts = await Product.find({ id: { $in: ids } });
        io.emit("products:updated", updatedProducts);
      }

      io.emit("orders:deleted", { id: q });
      res.sendStatus(204);
    } catch (err) {
      console.error("❌ Error DELETE /orders/:id:", err);
      res.status(400).json({ error: "No se pudo eliminar el pedido" });
    }
  });

  return router;
}
