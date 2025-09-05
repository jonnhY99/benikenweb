import mongoose from 'mongoose';

const NotificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
  title: { type: String, required: true },
  body:  { type: String, required: true },
  type:  { type: String, enum: ['order','system'], default: 'system' },
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
  read:  { type: Boolean, default: false }
}, { timestamps: true });

export default mongoose.model('Notification', NotificationSchema);
