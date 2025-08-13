// backend/models/LoginLog.js
import mongoose from 'mongoose';

const LoginLogSchema = new mongoose.Schema(
  {
    userId:   { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    name:     { type: String, required: true },
    email:    { type: String, required: true },
    role:     { type: String, enum: ['admin', 'carniceria', 'cliente'], required: true },
    ip:       { type: String },
    userAgent:{ type: String },
  },
  { timestamps: true }
);

LoginLogSchema.index({ createdAt: -1 });

export default mongoose.model('LoginLog', LoginLogSchema);
