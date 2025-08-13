// backend/routes/notifications.js
import express from 'express';
import PushSub from '../models/PushSub.js';
import Notification from '../models/Notification.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// si alguien monta esta ruta sin verifyToken desde server.js, aquí nos aseguramos
router.use((req, res, next) => verifyToken(req, res, next));

// clave pública para que el frontend se suscriba
router.get('/vapid-public', (_req, res) => {
  res.json({ publicKey: process.env.VAPID_PUBLIC_KEY || '' });
});

// guardar/actualizar suscripción push del usuario logueado
router.post('/subscribe', async (req, res) => {
  const userId = req.user.id;
  const { endpoint, keys } = req.body || {};
  if (!endpoint || !keys) return res.status(400).json({ message: 'Suscripción inválida' });

  await PushSub.updateOne({ userId, endpoint }, { $set: { keys } }, { upsert: true });
  res.json({ ok: true });
});

// listar notificaciones
router.get('/', async (req, res) => {
  const list = await Notification.find({ userId: req.user.id })
    .sort({ createdAt: -1 })
    .limit(200);
  res.json(list);
});

// marcar como leída
router.patch('/:id/read', async (req, res) => {
  await Notification.updateOne(
    { _id: req.params.id, userId: req.user.id },
    { $set: { read: true } }
  );
  res.json({ ok: true });
});

export default router;
