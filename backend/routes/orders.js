// backend/routes/orders.js
import express from 'express';
import Order from '../models/Order.js';
import Product from '../models/Product.js';

export default function ordersRouterFactory(io) {
  const router = express.Router();

  async function getNextOrderId() {
    const last = await Order.find().sort({ createdAt: -1 }).limit(1);
    let next = 1;
    if (last[0]?.id) {
      const n = parseInt(String(last[0].id).replace(/\D/g, ''), 10);
      if (!isNaN(n)) next = n + 1;
    }
    return `ORD${String(next).padStart(3, '0')}`;
  }

  // GET /api/orders
  router.get('/', async (_req, res) => {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  });

  // POST /api/orders  ==> valida stock y descuenta
  router.post('/', async (req, res) => {
    try {
      const payload = req.body || {};
      if (!payload.items?.length) {
        return res.status(400).json({ error: 'El pedido no contiene ítems' });
      }
      // normalizamos id del pedido
      if (!payload.id) payload.id = await getNextOrderId();

      // 1) Descontamos stock de forma atómica por ítem
      const ops = payload.items.map((it) => ({
        updateOne: {
          filter: { id: it.productId, stock: { $gte: it.quantity } },
          update: { $inc: { stock: -it.quantity } },
        },
      }));

      const bulk = await Product.bulkWrite(ops, { ordered: true });
      if (bulk.modifiedCount !== payload.items.length) {
        // Alguno no tenía stock suficiente
        return res.status(409).json({ error: 'Stock insuficiente en uno o más productos' });
      }

      // 2) Creamos pedido
      const order = await Order.create(payload);

      // 3) Obtenemos productos actualizados para avisar en tiempo real
      const ids = payload.items.map((i) => i.productId);
      const updatedProducts = await Product.find({ id: { $in: ids } });

      // 4) Emitimos eventos
      io.emit('orders:created', order);
      io.emit('products:updated', updatedProducts);

      res.status(201).json(order);
    } catch (err) {
      console.error(err);
      res.status(400).json({ error: 'No se pudo crear el pedido' });
    }
  });

  // PATCH /api/orders/:id/status  ==> solo cambia estado
  router.patch('/:id/status', async (req, res) => {
    try {
      const { status } = req.body;
      const order = await Order.findOneAndUpdate(
        { id: req.params.id },
        { status },
        { new: true }
      );
      if (!order) return res.sendStatus(404);
      io.emit('orders:updated', order);
      res.json(order);
    } catch (err) {
      console.error(err);
      res.status(400).json({ error: 'No se pudo actualizar el estado' });
    }
  });

  // DELETE /api/orders/:id  ==> repone stock y elimina
  router.delete('/:id', async (req, res) => {
    try {
      const order = await Order.findOneAndDelete({ id: req.params.id });
      if (!order) return res.sendStatus(404);

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
        io.emit('products:updated', updatedProducts);
      }

      io.emit('orders:deleted', { id: req.params.id });
      res.sendStatus(204);
    } catch (err) {
      console.error(err);
      res.status(400).json({ error: 'No se pudo eliminar el pedido' });
    }
  });

  return router;
}
