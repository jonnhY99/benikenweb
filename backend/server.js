// backend/server.js
import 'dotenv/config';
import express from 'express';
import http from 'http';
import cors from 'cors';
import mongoose from 'mongoose';
import { Server } from 'socket.io';

import ordersRouterFactory from './routes/orders.js';
import productsRouterFactory from './routes/products.js';
import authRouter from './routes/auth.js';
import logsRouter from './routes/logs.js';
import notificationsRouter from './routes/notifications.js';
import usersRouter from './routes/users.js'; // 👈 importar rutas de usuarios
import reviewsRouter from './routes/reviews.js';
import analyticsRouterFactory from './routes/analytics.js';
import { verifyToken, requireRole } from './middleware/auth.js';
import { getHealthStatus, getSimpleHealth } from './utils/healthCheck.js';

const app = express();
const server = http.createServer(app);

// Si usas proxy/Render/Nginx para poder ver la IP real
app.set('trust proxy', true);

// ===== CORS =====
const allowedOrigins = (process.env.CLIENT_URL || 'http://localhost:3000')
  .split(',')
  .map((s) => s.trim());

// Add production URLs if not already included
const productionOrigins = [
  'https://carnesbeniken.onrender.com',
  'https://crud-mern-beniken.onrender.com'
];

const allOrigins = [...new Set([...allowedOrigins, ...productionOrigins])];

app.use(cors({ 
  origin: allOrigins, 
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// ===== Healthcheck =====
app.get('/api/health', (_req, res) => res.json(getSimpleHealth()));
app.get('/api/health/detailed', async (_req, res) => {
  try {
    const health = await getHealthStatus();
    const statusCode = health.status === 'healthy' ? 200 : 
                      health.status === 'warning' ? 200 : 503;
    res.status(statusCode).json(health);
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// ===== Socket.IO =====
const io = new Server(server, {
  cors: { 
    origin: allOrigins, 
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    credentials: true
  },
  transports: ['websocket', 'polling'],
  allowEIO3: true
});

// Cada socket se une a una "room" con el id de usuario (envíalo desde el frontend en handshake.auth.userId)
io.on('connection', (socket) => {
  const userId = socket.handshake.auth?.userId;
  if (userId) socket.join(String(userId));
  console.log('Socket conectado:', socket.id, 'room:', userId ?? '-');
  socket.on('disconnect', () => console.log('Socket desconectado:', socket.id));
});

// ===== Rutas públicas =====
console.log('🔍 Mounting /api/auth routes');
app.use('/api/auth', authRouter);

// ===== Rutas de negocio (las factories reciben io) =====
app.use('/api/products', productsRouterFactory(io));
app.use('/api/orders', ordersRouterFactory(io));

// ===== Usuarios (solo admin puede listar/gestionar) =====
console.log('🔍 Mounting /api/users routes');
app.use('/api/users', usersRouter); // 👈 aquí montamos las rutas de usuarios

// ===== Pagos y validación de comprobantes =====
import paymentsRouter from './routes/payments.js';
app.use('/api/payments', paymentsRouter);

// ===== Reviews (reseñas de clientes) =====
app.use('/api/reviews', reviewsRouter);

// ===== Analytics (protegidas solo con token) =====
app.use('/api/analytics', verifyToken, analyticsRouterFactory(io));

// ===== Notificaciones y logs (protegidas) =====
app.use('/api/notifications', verifyToken, notificationsRouter);
app.use('/api/logs', verifyToken, requireRole('admin'), logsRouter);

// ===== Conexión a Mongo + arranque =====
const MONGODB_URI = process.env.MONGODB_URI;
const PORT = process.env.PORT || 5000;

if (!MONGODB_URI) {
  console.error('❌ Falta MONGODB_URI en variables de entorno');
  console.error('💡 Asegúrate de configurar MONGODB_URI en Render o tu archivo .env');
  process.exit(1);
}

console.log('🔍 Iniciando conexión a MongoDB...');
console.log('🔍 Puerto configurado:', PORT);
console.log('🔍 Entorno:', process.env.NODE_ENV);
console.log('🔍 CORS permitido para:', allOrigins.join(', '));

mongoose
  .connect(MONGODB_URI, { 
    serverSelectionTimeoutMS: 30000, // Aumentado para Render
    socketTimeoutMS: 45000,
    connectTimeoutMS: 30000,
    maxPoolSize: 10,
    minPoolSize: 1,
    maxIdleTimeMS: 30000,
    bufferCommands: false,
    retryWrites: true,
    writeConcern: {
      w: 'majority'
    }
  })
  .then(() => {
    console.log('✅ MongoDB conectado exitosamente');
    console.log('🔍 Base de datos:', mongoose.connection.name);
    
    server.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
      console.log(`🌐 Entorno: ${process.env.NODE_ENV}`);
      console.log(`🔗 CORS configurado para: ${allOrigins.join(', ')}`);
      console.log('✅ Servidor listo para recibir conexiones');
    });
  })
  .catch((err) => {
    console.error('❌ Error conectando a MongoDB:', err?.message || err);
    console.error('💡 Verifica tu cadena de conexión y que MongoDB Atlas esté accesible');
    process.exit(1);
  });

// ===== Manejo de errores no controlados =====
process.on('unhandledRejection', (reason, promise) => {
  console.error('🔴 Unhandled Rejection at:', promise, 'reason:', reason);
  // En producción, podrías querer cerrar el proceso gracefully
  if (process.env.NODE_ENV === 'production') {
    console.error('🔴 Cerrando servidor debido a unhandled rejection');
    process.exit(1);
  }
});

process.on('uncaughtException', (err) => {
  console.error('🔴 Uncaught Exception:', err);
  console.error('🔴 Cerrando servidor debido a uncaught exception');
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🔄 SIGTERM recibido, cerrando servidor gracefully...');
  server.close(() => {
    console.log('✅ Servidor cerrado');
    mongoose.connection.close(false, () => {
      console.log('✅ Conexión MongoDB cerrada');
      process.exit(0);
    });
  });
});

process.on('SIGINT', () => {
  console.log('🔄 SIGINT recibido, cerrando servidor gracefully...');
  server.close(() => {
    console.log('✅ Servidor cerrado');
    mongoose.connection.close(false, () => {
      console.log('✅ Conexión MongoDB cerrada');
      process.exit(0);
    });
  });
});
