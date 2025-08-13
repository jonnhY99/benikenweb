// backend/routes/logs.js
import express from 'express';
import LoginLog from '../models/LoginLog.js';

const router = express.Router();

// GET /api/logs?limit=200
router.get('/', async (req, res) => {
  const limit = Math.min(parseInt(req.query.limit || '200', 10), 1000);
  const rows = await LoginLog.find({})
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();

  res.json(rows);
});

export default router;
