// backend/server.js
import 'dotenv/config';
import express from 'express';
import http from 'http';
import cors from 'cors';
import mongoose from 'mongoose';
import { Server } from 'socket.io';

import ordersRouterFactory from './routes/orders.js';
import productsRouterFactory from './routes/products.js';
import authRouter from './routes/auth.js'; // <-- login simple

const app = express();
const server = http.createServer(app);

// === Orígenes permitidos (separados por coma en CLIENT_URL)
const allowedOrigins = (process.env.CLIENT_URL || 'http://localhost:3000')
  .split(',')
  .map(s => s.trim());

// ---- Middlewares PRIMERO (antes de rutas)
app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(express.json());

// Healthcheck útil
app.get('/api/health', (_req, res) => res.json({ ok: true }));

// ---- Socket.IO
const io = new Server(server, {
  cors: { origin: allowedOrigins, methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'] },
});

// ---- Rutas (después de middlewares, una sola vez)
app.use('/api/auth', authRouter);
app.use('/api/products', productsRouterFactory(io));
app.use('/api/orders', ordersRouterFactory(io));

// ---- Validación .env
const MONGODB_URI = process.env.MONGODB_URI;
const PORT = process.env.PORT || 5000;

if (!MONGODB_URI) {
  console.error('❌ FALTA MONGODB_URI en backend/.env');
  process.exit(1);
}

// ---- Conexión a Mongo + arranque
mongoose
  .connect(MONGODB_URI, { serverSelectionTimeoutMS: 8000, autoIndex: true })
  .then(() => {
    console.log('✅ MongoDB conectado');

    io.on('connection', (socket) => {
      console.log('Socket conectado:', socket.id);
      socket.on('disconnect', () => console.log('Socket desconectado:', socket.id));
    });

    server.listen(PORT, () => {
      console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
      console.log(`🔗 CORS permitido: ${allowedOrigins.join(', ')}`);
    });
  })
  .catch((err) => {
    console.error('❌ Error conectando a MongoDB:', err?.message || err);
    process.exit(1);
  });
