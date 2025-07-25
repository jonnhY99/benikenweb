import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Verificar si el usuario está autenticado
export const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-password');
      next();
    } catch (error) {
      return res.status(401).json({ message: 'Token no válido o expirado' });
    }
  } else {
    return res.status(401).json({ message: 'No hay token, acceso denegado' });
  }
};

// Verificar si el usuario tiene un rol específico
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'No tienes permiso para realizar esta acción' });
    }
    next();
  };
};
