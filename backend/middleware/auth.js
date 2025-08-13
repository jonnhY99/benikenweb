// backend/middleware/auth.js
import jwt from 'jsonwebtoken';

const { JWT_SECRET = 'dev_secret' } = process.env;

/** Firma un JWT con expiración por defecto de 8h */
export const signToken = (payload, opts = {}) =>
  jwt.sign(payload, JWT_SECRET, { expiresIn: '8h', ...opts });

/** Verifica el token y deja el usuario en req.user */
export const verifyToken = (req, res, next) => {
  try {
    let token = null;

    // Bearer <token>
    const auth = req.headers.authorization || '';
    if (auth.startsWith('Bearer ')) token = auth.slice(7);

    // alternativos opcionales
    if (!token && req.headers['x-access-token']) token = req.headers['x-access-token'];
    if (!token && req.query?.token) token = req.query.token;

    if (!token) return res.status(401).json({ message: 'Token requerido' });

    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (e) {
    return res.status(401).json({ message: 'Token inválido' });
  }
};

/** Restringe por roles: requireRole('admin') o requireRole('admin','carniceria') */
export const requireRole = (...roles) => (req, res, next) => {
  if (!req.user) return res.status(401).json({ message: 'No autenticado' });
  if (roles.length && !roles.includes(req.user.role)) {
    return res.status(403).json({ message: 'No autorizado' });
  }
  next();
};

export default { verifyToken, requireRole, signToken };
