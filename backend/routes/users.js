import express from 'express';
import {
  registerUser,
  loginUser,
  getUsers,
  getLoginLogs,
  updateUser,
  deleteUser,
  registerPurchase,
  getFrequentUsers
} from '../controllers/userController.js';
import { verifyToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

// Registrar un nuevo usuario
router.post('/register', registerUser);

// Login de usuario
router.post('/login', loginUser);

// Registrar compra
router.post('/purchase', registerPurchase);

// Obtener usuarios frecuentes
router.get('/frequent', verifyToken, requireRole('admin'), getFrequentUsers);

// Listar todos los usuarios (solo admin)
router.get('/', verifyToken, requireRole('admin'), getUsers);

// Obtener logs de login
router.get('/login-logs', verifyToken, requireRole('admin'), getLoginLogs);

// Actualizar usuario
router.put('/:id', verifyToken, requireRole('admin'), updateUser);

// Eliminar usuario
router.delete('/:id', verifyToken, requireRole('admin'), deleteUser);

export default router;
