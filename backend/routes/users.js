import express from 'express';
import { 
  registerUser, 
  loginUser, 
  getUsers, 
  getLoginLogs,
  getFrequentUsers,
  updateUser, 
  deleteUser, 
  registerPurchase,
  testEncryption 
} from '../controllers/userController.js';
import { verifyToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

// Registrar un nuevo usuario
router.post('/register', registerUser);

// Login de usuario
router.post('/login', loginUser);

// Registrar compra
console.log('🔍 Registering /purchase route');
router.post('/purchase', registerPurchase);

// Test encryption endpoint
router.get('/test-encryption', testEncryption);

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
