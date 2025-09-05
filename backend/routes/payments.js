import express from 'express';
import { confirmPayment, validateReceipt } from '../controllers/paymentController.js';
import { verifyToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

// Confirmar pago recibido (admin/carniceria)
router.post('/confirm/:orderId', verifyToken, requireRole('admin', 'carniceria'), confirmPayment);

// Validar comprobante de transferencia (admin/carniceria)
router.post('/validate-receipt/:orderId', verifyToken, requireRole('admin', 'carniceria'), validateReceipt);

export default router;
