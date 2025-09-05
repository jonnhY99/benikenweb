import express from 'express';
import {
  createReview,
  getReviews,
  getReviewStats,
  getAllReviews,
  updateReviewStatus,
  deleteReview
} from '../controllers/reviewController.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.post('/', createReview);
router.get('/', getReviews);
router.get('/stats', getReviewStats);

// Admin routes (require authentication)
router.get('/admin/all', verifyToken, getAllReviews);
router.put('/admin/:id/status', verifyToken, updateReviewStatus);
router.delete('/admin/:id', verifyToken, deleteReview);

export default router;
