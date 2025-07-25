import express from 'express';
import { getOrders, createOrder, updateOrderStatus, deleteOrder } from '../controllers/orderController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/', protect, authorize('admin', 'carniceria'), getOrders);
router.post('/', protect, authorize('cliente'), createOrder);
router.put('/:id', protect, authorize('admin', 'carniceria'), updateOrderStatus);
router.delete('/:id', protect, authorize('admin'), deleteOrder);

export default router;
