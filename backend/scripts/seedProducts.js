// backend/scripts/seedProducts.js (ESM)
import 'dotenv/config';
import mongoose from 'mongoose';
import Product from '../models/Product.js';

const data = [
  {
    id: '1',
    name: 'Tocino',
    description: 'El mejor tocino con la mejor oferta.',
    price: 1698,
    unit: 'kg',
    image: '/image/tocino.png',
    stock: 50,
    isActive: true,
  },
  {
    id: '2',
    name: 'Huesitos',
    description: 'Huesitos de carne.',
    price: 698,
    unit: 'kg',
    image: '/image/huesitos_de_carne.png',
    stock: 100,
    isActive: true,
  },
  {
    id: '3',
    name: 'Costillas de Cerdo',
    description: 'Costillas de cerdo frescas, perfectas para la parrilla.',
    price: 6298,
    unit: 'kg',
    image: '/image/costillar_de_cerdo.png',
    stock: 75,
    isActive: true,
  },
];

(async () => {
  await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 8000 });
  for (const p of data) {
    await Product.updateOne({ id: p.id }, { $set: p }, { upsert: true }); // crea o actualiza
  }
  console.log('✅ Seed de productos OK');
  await mongoose.disconnect();
})();
