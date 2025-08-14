// backend/models/Order.js
import mongoose from 'mongoose';

const ItemSchema = new mongoose.Schema(
  {
    productId: String,
    name: String,
    quantity: Number,
    unit: String,   // p.ej. 'kg'
    price: Number,  // CLP
  },
  { _id: false }
);

const OrderSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true }, // ej. ORD001
    customerName: { type: String, required: true },
    customerPhone: { type: String, required: true },
    customerEmail: { type: String, required: true },
    note: { type: String, default: '' }, // Nota opcional del cliente
    // Hora de retiro en formato "HH:mm AM/PM"  
    pickupTime: { type: String, required: true }, // "03:00 PM"
    status: {
      type: String,
      enum: ['Pendiente', 'Listo', 'Entregado'],
      default: 'Pendiente',
    },
    totalCLP: { type: Number, default: 0 },
    items: [ItemSchema],
  },
  { timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' } }
);

export default mongoose.model('Order', OrderSchema);
