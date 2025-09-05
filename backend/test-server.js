// backend/test-server.js
// Test básico del servidor sin MongoDB
import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 5000;

// CORS
app.use(cors({ 
  origin: ['http://localhost:3000', 'http://localhost:3001'], 
  credentials: true 
}));
app.use(express.json());

// Test routes
app.get('/api/health', (req, res) => {
  res.json({ ok: true, message: 'Server is running' });
});

app.get('/api/products', (req, res) => {
  res.json({ 
    success: true, 
    data: [
      { id: '1', name: 'Producto Test', price: 1000, stock: 10 }
    ] 
  });
});

app.get('/api/orders', (req, res) => {
  res.json({ 
    success: true, 
    data: [
      { id: '1', customerName: 'Cliente Test', status: 'pending', total: 1000 }
    ] 
  });
});

app.listen(PORT, () => {
  console.log(`✅ Test server running on port ${PORT}`);
  console.log(`🔗 Health: http://localhost:${PORT}/api/health`);
  console.log(`📦 Products: http://localhost:${PORT}/api/products`);
  console.log(`📋 Orders: http://localhost:${PORT}/api/orders`);
});
