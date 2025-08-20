import Order from "../models/Order.js";

// 🔹 Normalizar el estado recibido
function normalizeStatus(status) {
  if (!status) return "Pendiente";
  const s = status.toLowerCase();
  if (s.includes("pendiente")) return "Pendiente";
  if (s.includes("preparacion")) return "En preparación";
  if (s.includes("listo")) return "Listo";
  if (s.includes("entregado")) return "Entregado";
  return "Pendiente";
}

// Crear nuevo pedido
export const createOrder = async (req, res) => {
  try {
    const newOrder = new Order({
      ...req.body,
      status: normalizeStatus(req.body.status || "Pendiente"),
      reviewed: false, // 🔹 al inicio no está revisado
    });
    await newOrder.save();
    res.status(201).json(newOrder);
  } catch (error) {
    res.status(500).json({ message: "Error al crear pedido", error });
  }
};

// Obtener todos los pedidos
export const getOrders = async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener pedidos", error });
  }
};

// Actualizar estado de un pedido
export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const normalized = normalizeStatus(status);

    const update = { status: normalized };

    // 🔹 Si el estado es "Listo" → marcar como revisado
    if (normalized === "Listo") {
      update.reviewed = true;
    }

    const order = await Order.findOneAndUpdate(
      { id },
      update,
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ message: "Pedido no encontrado" });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: "Error al actualizar estado", error });
  }
};

// Eliminar pedido
export const deleteOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await Order.findOneAndDelete({ id });
    if (!order) {
      return res.status(404).json({ message: "Pedido no encontrado" });
    }
    res.json({ message: "Pedido eliminado correctamente" });
  } catch (error) {
    res.status(500).json({ message: "Error al eliminar pedido", error });
  }
};

