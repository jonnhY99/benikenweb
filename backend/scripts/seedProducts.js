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
    name: 'Costillar de Cerdo',
    description: 'Costillar de cerdo fresco, perfectas para la parrilla.',
    price: 6298,
    unit: 'kg',
    image: '/image/costillar_de_cerdo.png',
    stock: 75,
    isActive: true,
  },
   {
    id: '4',
    name: 'Chuleta de Centro',
    description: 'Chuletas de cerdo frescas, perfectas para la parrilla o el sarten.',
    price: 3998,
    unit: 'kg',
    image: '/image/chuletas_de_cerdo.png',
    stock: 75,
    isActive: true,
  },
   {
    id: '5',
    name: 'Punta de Costilla',
    description: 'Punta de costilla perfectas y frescas.',
    price: 2798,
    unit: 'kg',
    image: '/image/punta_de_costilla.png',
    stock: 75,
    isActive: true,
  },
  {
    id: '6',
    name: 'Costillar Baby Ribs',
    description: 'Costillar perfecto, para horno y parrilla.',
    price: 5398,
    unit: 'kg',
    image: '/image/costillar_baby_ribs.png',
    stock: 75,
    isActive: true,
  },
  {
    id: '7',
    name: 'Lomito de Centro',
    description: 'Para horno y parrilla.',
    price: 4998,
    unit: 'kg',
    image: '/image/Lomo_de_cerdo.png',
    stock: 75,
    isActive: true,
  },
  {
    id: '8',
    name: 'Pulpa Deshuesada',
    description: 'Pulpa fresca para horno y parrilla.',
    price: 4498,
    unit: 'kg',
    image: '/image/pulpa_deshuesada.png',
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
