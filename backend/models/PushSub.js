import mongoose from 'mongoose';

const PushSubSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
  endpoint: { type: String, required: true },
  keys: {
    p256dh: String,
    auth: String
  }
}, { timestamps: true });

PushSubSchema.index({ userId:1, endpoint:1 }, { unique: true });

export default mongoose.model('PushSub', PushSubSchema);
