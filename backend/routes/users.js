import express from 'express';
import { registerUser, loginUser, getUsers } from '../controllers/userController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/', protect, authorize('admin'), getUsers);

export default router;
