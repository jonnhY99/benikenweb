import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  customerName: { type: String, required: true },
  customerPhone: { type: String, required: true },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Relación con el modelo de usuario
  },
  items: [
    {
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
      },
      name: { type: String, required: true },
      quantity: { type: Number, required: true, min: 1 },
      unit: { type: String, default: 'kg' },
      price: { type: Number, required: true }
    }
  ],
  total: { type: Number, required: true },
  pickupTime: { type: Date, required: true },
  status: { 
    type: String, 
    enum: ['Pendiente', 'En preparación', 'Listo para retiro', 'Entregado', 'Cancelado'],
    default: 'Pendiente'
  },
  delivery: { type: Boolean, default: false },
  deliveryAddress: { type: String },
}, {
  timestamps: true // añade createdAt y updatedAt
});

export default mongoose.model('Order', orderSchema);
