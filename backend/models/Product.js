// backend/models/Product.js
import mongoose from 'mongoose';

const ProductSchema = new mongoose.Schema(
  {
    // Conservamos un "id" legible para que el frontend no tenga que cambiar
    id: { type: String, required: true, unique: true }, // ej: "1", "2", "3"
    name: { type: String, required: true },
    description: { type: String, default: '' },
    price: { type: Number, required: true },   // CLP por unidad
    unit: { type: String, default: 'kg' },     // ej. 'kg'
    image: { type: String, default: '' },      // ruta/URL
    stock: { type: Number, default: 0 },       // stock disponible
    isActive: { type: Boolean, default: true },// para ocultar sin borrar
  },
  { timestamps: true }
);

export default mongoose.model('Product', ProductSchema);
