// backend/routes/products.js
import express from 'express';
import Product from '../models/Product.js';

export default function productsRouterFactory(io) {
  const router = express.Router();

  // Listado público
  router.get('/', async (_req, res) => {
    const products = await Product.find({ isActive: true }).sort({ id: 1 });
    res.json(products);
  });

  // Crear (útil para cargar catálogo inicial) - puedes protegerlo con auth si quieres
  router.post('/', async (req, res) => {
    try {
      const p = await Product.create(req.body);
      io.emit('products:updated', [p]); // broadcast
      res.status(201).json(p);
    } catch (err) {
      console.error(err);
      res.status(400).json({ error: 'No se pudo crear el producto' });
    }
  });

  // Actualizar/ajustar (precio, stock, etc.)
  router.patch('/:id', async (req, res) => {
    try {
      const p = await Product.findOneAndUpdate({ id: req.params.id }, req.body, { new: true });
      if (!p) return res.sendStatus(404);
      io.emit('products:updated', [p]);
      res.json(p);
    } catch (err) {
      console.error(err);
      res.status(400).json({ error: 'No se pudo actualizar el producto' });
    }
  });
  router.post('/bulk', async (req, res) => {
  try {
    const arr = Array.isArray(req.body) ? req.body : [];
    if (!arr.length) return res.status(400).json({ error: 'Array vacío' });
    const ops = arr.map(p => ({
      updateOne: { filter: { id: p.id }, update: { $set: p }, upsert: true }
    }));
    await Product.bulkWrite(ops, { ordered: false });
    const ids = arr.map(x => x.id);
    const updated = await Product.find({ id: { $in: ids } });
    io.emit('products:updated', updated);
    res.status(201).json(updated);
  } catch (e) {
    console.error(e);
    res.status(400).json({ error: 'No se pudo cargar el catálogo' });
  }
});


  return router;
}
