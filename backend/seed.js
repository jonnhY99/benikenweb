import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from './models/Product.js';
import Order from './models/Order.js';

dotenv.config();

// Datos de ejemplo (productos)
const sampleProducts = [
  {
    name: 'Arrachera Marinada',
    description: 'Corte de res marinado listo para asar, suave y jugoso.',
    price: 180.00,
    unit: 'kg',
    image: 'https://via.placeholder.com/150/FF5733/FFFFFF?text=Arrachera',
    stock: 50,
  },
  {
    name: 'Chorizo Argentino',
    description: 'Chorizo casero con especias tradicionales, ideal para parrilla.',
    price: 90.00,
    unit: 'pieza',
    image: 'https://via.placeholder.com/150/33FF57/FFFFFF?text=Chorizo',
    stock: 100,
  },
  {
    name: 'Costillas de Cerdo',
    description: 'Costillas de cerdo frescas, perfectas para barbacoa.',
    price: 120.00,
    unit: 'kg',
    image: 'https://via.placeholder.com/150/3357FF/FFFFFF?text=Costillas',
    stock: 75,
  }
];

// Datos de ejemplo (pedidos)
const sampleOrders = [
  {
    customerName: 'Juan Pérez',
    customerPhone: '5512345678',
    pickupTime: new Date(Date.now() + 2 * 60 * 60 * 1000),
    status: 'Pendiente',
    items: [
      { name: 'Arrachera Marinada', quantity: 2, price: 180.00, unit: 'kg' },
      { name: 'Chorizo Argentino', quantity: 5, price: 90.00, unit: 'pieza' }
    ],
    total: 810.00
  },
  {
    customerName: 'María García',
    customerPhone: '5587654321',
    pickupTime: new Date(Date.now() + 4 * 60 * 60 * 1000),
    status: 'Entregado',  // Cambié "Completado" a "Entregado"
    items: [
      { name: 'Costillas de Cerdo', quantity: 3, price: 120.00, unit: 'kg' }
    ],
    total: 360.00
  }
];


const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Conectado a MongoDB');

    // Limpiar colecciones antes de poblar
    await Product.deleteMany();
    await Order.deleteMany();

    // Insertar productos
    const createdProducts = await Product.insertMany(sampleProducts);
    console.log(`${createdProducts.length} productos insertados`);

    // Crear un mapa de nombres → IDs de producto
    const productMap = {};
    createdProducts.forEach(prod => {
      productMap[prod.name] = prod._id;
    });

    // Reemplazar items con referencias reales a productos
    const ordersWithRefs = sampleOrders.map(order => ({
      ...order,
      items: order.items.map(item => ({
        product: productMap[item.name],
        name: item.name,
        quantity: item.quantity,
        unit: item.unit,
        price: item.price
      }))
    }));

    // Insertar pedidos
    const createdOrders = await Order.insertMany(ordersWithRefs);
    console.log(`${createdOrders.length} pedidos insertados`);

    console.log('Base de datos inicializada con éxito');
    mongoose.connection.close();
  } catch (error) {
    console.error('Error al poblar la base de datos:', error);
    mongoose.connection.close();
  }
};

seedDatabase();
