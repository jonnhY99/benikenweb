import Order from '../models/Order.js';

// Listar pedidos (para admin y carnicería)
export const getOrders = async (req, res) => {
  try {
    const orders = await Order.find().populate('customer').populate('items.product');
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener pedidos', error });
  }
};

// Crear nuevo pedido
export const createOrder = async (req, res) => {
  try {
    const order = new Order(req.body);
    const savedOrder = await order.save();
    res.status(201).json(savedOrder);
  } catch (error) {
    res.status(400).json({ message: 'Error al crear pedido', error });
  }
};

// Actualizar estado del pedido
export const updateOrderStatus = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Pedido no encontrado' });

    order.status = req.body.status || order.status;
    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } catch (error) {
    res.status(400).json({ message: 'Error al actualizar estado del pedido', error });
  }
};

// Eliminar pedido
export const deleteOrder = async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);
    if (!order) return res.status(404).json({ message: 'Pedido no encontrado' });
    res.json({ message: 'Pedido eliminado' });
  } catch (error) {
    res.status(400).json({ message: 'Error al eliminar pedido', error });
  }
};
