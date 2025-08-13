// backend/models/LoginLog.js
import mongoose from 'mongoose';

const loginLogSchema = new mongoose.Schema(
  {
    name:   { type: String, required: true },
    email:  { type: String, required: true },
    role:   { type: String, required: true },
    ip:     { type: String, default: '-' },
    userAgent: { type: String, default: '-' },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true } // createdAt / updatedAt automáticos
);

// índices para búsquedas rápidas
loginLogSchema.index({ createdAt: -1 });
loginLogSchema.index({ email: 1 });
loginLogSchema.index({ role: 1 });

export default mongoose.model('LoginLog', loginLogSchema);
