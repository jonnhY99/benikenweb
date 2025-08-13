// backend/routes/logs.js
import express from 'express';
import mongoose from 'mongoose';
import LoginLog from '../models/LoginLog.js';

const router = express.Router();

/**
 * GET /api/logs
 * Query params:
 *  - search: string (busca en name, email, ip y role - regex)
 *  - role: 'admin' | 'carniceria' | 'cliente'
 *  - from: ISO Date
 *  - to: ISO Date
 *  - page: number (1..n)
 *  - limit: number (default 20)
 *  - sort: 'asc' | 'desc' (por createdAt)
 */
router.get('/', async (req, res) => {
  try {
    const {
      search = '',
      role = '',
      from = '',
      to = '',
      page = '1',
      limit = '20',
      sort = 'desc',
    } = req.query;

    const filter = {};

    if (search) {
      const regex = new RegExp(search.trim(), 'i');
      filter.$or = [
        { name: regex },
        { email: regex },
        { ip: regex },
        { role: regex },
      ];
    }

    if (role) {
      filter.role = role;
    }

    if (from || to) {
      filter.createdAt = {};
      if (from) filter.createdAt.$gte = new Date(from);
      if (to)   filter.createdAt.$lte = new Date(to);
    }

    const pageNum = Math.max(parseInt(page, 10) || 1, 1);
    const limitNum = Math.min(Math.max(parseInt(limit, 10) || 20, 1), 200);
    const skip = (pageNum - 1) * limitNum;

    const [items, total] = await Promise.all([
      LoginLog.find(filter)
        .sort({ createdAt: sort === 'asc' ? 1 : -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      LoginLog.countDocuments(filter),
    ]);

    res.json({
      items,
      meta: {
        total,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (err) {
    console.error('GET /logs error:', err);
    res.status(500).json({ message: 'Error obteniendo logs' });
  }
});

/**
 * DELETE /api/logs/:id  (borrado individual)
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: 'ID inválido' });
    }
    await LoginLog.findByIdAndDelete(id);
    res.json({ ok: true });
  } catch (err) {
    console.error('DELETE /logs/:id error:', err);
    res.status(500).json({ message: 'Error eliminando log' });
  }
});

/**
 * DELETE /api/logs
 * Body JSON admite:
 *  - ids: string[] (borrado por lote)
 *  - before: ISO Date (elimina todos los logs anteriores a esa fecha)
 *  - from & to: ISO Date (rango)
 *  - all: true (borra TODO) → úsalo con cuidado!
 */
router.delete('/', async (req, res) => {
  try {
    const { ids, before, from, to, all } = req.body || {};

    let result;
    if (Array.isArray(ids) && ids.length) {
      const validIds = ids.filter((x) => mongoose.isValidObjectId(x));
      result = await LoginLog.deleteMany({ _id: { $in: validIds } });
    } else if (before) {
      result = await LoginLog.deleteMany({ createdAt: { $lt: new Date(before) } });
    } else if (from || to) {
      const range = {};
      if (from) range.$gte = new Date(from);
      if (to)   range.$lte = new Date(to);
      result = await LoginLog.deleteMany({ createdAt: range });
    } else if (all === true) {
      result = await LoginLog.deleteMany({});
    } else {
      return res.status(400).json({ message: 'Parámetros de borrado inválidos' });
    }

    res.json({ ok: true, deleted: result?.deletedCount || 0 });
  } catch (err) {
    console.error('DELETE /logs error:', err);
    res.status(500).json({ message: 'Error en eliminación de logs' });
  }
});

export default router;
