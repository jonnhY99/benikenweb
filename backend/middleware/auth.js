// backend/middleware/auth.js
export function requireAuth(req, res, next) {
  const auth = req.headers.authorization || '';
  const token = auth.replace(/^Bearer\s+/i, '');
  if (token !== 'dev-token') return res.status(401).json({ error: 'No autorizado' });
  next();
}
