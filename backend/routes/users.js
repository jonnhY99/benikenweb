import express from 'express';
import { 
  registerUser, 
  loginUser, 
  getUsers, 
  getLoginLogs 
} from '../controllers/userController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Registrar un nuevo usuario
router.post('/register', registerUser);

// Login de usuario (crea log de sesión automáticamente en el controller)
router.post('/login', loginUser);

// Listar todos los usuarios (solo admin)
router.get('/', protect, authorize('admin'), getUsers);

// Obtener todos los logs de inicio de sesión (solo admin)
router.get('/login-logs', protect, authorize('admin'), getLoginLogs);

export default router;
