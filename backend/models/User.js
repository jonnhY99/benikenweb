import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name:  { type: String, required: true },
  email: { type: String, required: true, unique: true, index: true },
  password: { type: String, required: true }, // hash bcrypt
  role:  { type: String, enum: ['admin', 'carniceria', 'cliente'], default: 'cliente' },
}, { timestamps: true });

export default mongoose.model('User', userSchema);
