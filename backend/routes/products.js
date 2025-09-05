// backend/routes/products.js
import express from 'express';
import Product from '../models/Product.js';
import { verifyToken, requireRole } from '../middleware/auth.js';

export default function productsRouterFactory(io) {
  const router = express.Router();

  // Listado público
  router.get('/', async (_req, res) => {
    const products = await Product.find({ isActive: true }).sort({ id: 1 });
    res.json(products);
  });

  // Obtener producto específico
  router.get('/:id', async (req, res) => {
    try {
      const product = await Product.findOne({ id: req.params.id });
      if (!product) return res.status(404).json({ error: 'Producto no encontrado' });
      res.json(product);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Error al obtener el producto' });
    }
  });

  // Crear producto (solo admin)
  router.post('/', verifyToken, requireRole('admin'), async (req, res) => {
    try {
      // Generar ID único
      const lastProduct = await Product.findOne().sort({ id: -1 });
      const nextId = lastProduct ? (parseInt(lastProduct.id) + 1).toString() : '1';
      
      const productData = {
        ...req.body,
        id: nextId
      };
      
      const p = await Product.create(productData);
      io.emit('products:updated', [p]); // broadcast
      res.status(201).json(p);
    } catch (err) {
      console.error(err);
      res.status(400).json({ error: 'No se pudo crear el producto' });
    }
  });

  // Actualizar producto (solo admin)
  router.patch('/:id', verifyToken, requireRole('admin'), async (req, res) => {
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

  // Eliminar producto (solo admin) - soft delete
  router.delete('/:id', verifyToken, requireRole('admin'), async (req, res) => {
    try {
      const p = await Product.findOneAndUpdate(
        { id: req.params.id }, 
        { isActive: false }, 
        { new: true }
      );
      if (!p) return res.sendStatus(404);
      io.emit('products:updated', [p]);
      res.json({ message: 'Producto eliminado correctamente' });
    } catch (err) {
      console.error(err);
      res.status(400).json({ error: 'No se pudo eliminar el producto' });
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
