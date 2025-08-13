// backend/routes/auth.js
import { Router } from 'express';
import bcrypt from 'bcryptjs';

// ⚠️ Usa el path real de tu modelo de usuario.
// Si tu archivo se llama models/users.js, cambia la línea siguiente.
import User from '../models/User.js';

import LoginLog from '../models/LoginLog.js';
import { signToken, verifyToken } from '../middleware/auth.js';

const router = Router();

/** POST /api/auth/login */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body ?? {};
    if (!email || !password) {
      return res.status(400).json({ message: 'Email y contraseña son obligatorios' });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: 'Correo o contraseña inválidos' });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ message: 'Correo o contraseña inválidos' });

    const token = signToken({
      id: user._id.toString(),
      email: user.email,
      role: user.role,
      name: user.name,
    });

  // Registrar Log de inicio de sesión (no detiene el login si falla)
try {
  await LoginLog.create({
    name: user.name,               // <-- antes decía userName
    email: user.email,
    role: user.role,
    ip: req.ip,
    userAgent: req.headers['user-agent'] || '',
    createdAt: new Date(),
    userId: user._id,              // opcional, útil para trazabilidad
  });
} catch (e) {
  console.warn('No se pudo guardar login log:', e.message || e);
}


    const safeUser = { id: user._id, name: user.name, email: user.email, role: user.role };
    return res.json({ token, user: safeUser });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ message: 'Error al iniciar sesión' });
  }
});

/** GET /api/auth/me (requiere token) */
router.get('/me', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('name email role');
    if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });
    res.json({ user });
  } catch (e) {
    res.status(500).json({ message: 'Error al obtener el usuario' });
  }
});

export default router;
