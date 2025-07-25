import mongoose from 'mongoose';

// Definimos el esquema del producto (estructura de campos)
const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  unit: { type: String, default: 'kg' },
  image: { type: String },
  stock: { type: Number, default: 0 }
}, {
  timestamps: true // añade createdAt y updatedAt automáticamente
});

// Exportamos el modelo
export default mongoose.model('Product', productSchema);
