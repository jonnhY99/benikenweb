// backend/routes/auth.js
import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

import User from '../models/User.js';
import LoginLog from '../models/LoginLog.js';

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '12h';

function getClientIp(req) {
  const xf = req.headers['x-forwarded-for'];
  if (xf) return xf.split(',')[0].trim();
  return req.ip || req.connection?.remoteAddress || '-';
}

// === LOGIN SIN TOKEN/OTP ===
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body ?? {};
    if (!email || !password) {
      return res.status(400).json({ message: 'Email y contraseña son requeridos.' });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).lean();
    if (!user) {
      return res.status(401).json({ message: 'Correo o contraseña inválidos' });
    }

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) {
      return res.status(401).json({ message: 'Correo o contraseña inválidos' });
    }

    // 👉 NO se exige token/OTP (eliminado).
    const payload = { id: user._id.toString(), email: user.email, role: user.role };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

    // Log de inicio (no bloquea si falla)
    try {
      await LoginLog.create({
        userId: user._id,
        name: user.name || '',
        email: user.email,
        role: user.role,
        ip: getClientIp(req),
        userAgent: req.headers['user-agent'] || '',
        createdAt: new Date(),
      });
    } catch (e) {
      console.warn('No se pudo guardar login log:', e.message || e);
    }

    return res.json({
      token,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error('Error en /api/auth/login:', err);
    return res.status(500).json({ message: 'Error interno' });
  }
});

export default router;
