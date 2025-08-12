// backend/routes/auth.js
import express from 'express';
const router = express.Router();

/** Usuarios de prueba (puedes moverlos a Mongo después) */
const USERS = [
  { email: 'admin@beniken.com',      password: 'admin123', role: 'admin',      name: 'Administrador' },
  { email: 'carniceria@beniken.com', password: 'carne123', role: 'carniceria', name: 'Carnicería Local' },
];

/** POST /api/auth/login */
router.post('/login', (req, res) => {
  const { email, password } = req.body || {};
  const user = USERS.find(u => u.email === email && u.password === password);
  if (!user) return res.status(401).json({ error: 'Credenciales inválidas' });

  const token = 'dev-token'; // token de demo
  res.json({ token, user: { name: user.name, email: user.email, role: user.role } });
});

/** GET /api/auth/me (opcional) */
router.get('/me', (req, res) => {
  const auth = req.headers.authorization || '';
  const token = auth.replace(/^Bearer\s+/i, '');
  if (token !== 'dev-token') return res.status(401).json({ error: 'No autorizado' });

  res.json({ name: 'Administrador', email: 'admin@beniken.com', role: 'admin' });
});

export default router;
