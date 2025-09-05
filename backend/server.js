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

const app = express();
const server = http.createServer(app);

// Si usas proxy/Render/Nginx para poder ver la IP real
app.set('trust proxy', true);

// ===== CORS =====
const allowedOrigins = (process.env.CLIENT_URL || 'http://localhost:3000')
  .split(',')
  .map((s) => s.trim());

app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(express.json());

// ===== Healthcheck =====
app.get('/api/health', (_req, res) => res.json({ ok: true }));

// ===== Socket.IO =====
const io = new Server(server, {
  cors: { origin: allowedOrigins, methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'] },
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
  console.error('❌ Falta MONGODB_URI en backend/.env');
  process.exit(1);
}

mongoose
  .connect(MONGODB_URI, { serverSelectionTimeoutMS: 8000, autoIndex: true })
  .then(() => {
    console.log('✅ MongoDB conectado');
    server.listen(PORT, () => {
      console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
      console.log(`🔗 CORS permitido: ${allowedOrigins.join(', ')}`);
    });
  })
  .catch((err) => {
    console.error('❌ Error conectando a MongoDB:', err?.message || err);
    process.exit(1);
  });

// (Opcional) Mejor manejo de errores no controlados
process.on('unhandledRejection', (reason) => console.error('🔴 Unhandled Rejection:', reason));
process.on('uncaughtException', (err) => console.error('🔴 Uncaught Exception:', err));
