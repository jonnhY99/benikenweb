// backend/start-simple.js
// Script simple para iniciar el servidor con configuración básica
import { MongoMemoryServer } from 'mongodb-memory-server';

async function startServer() {
  try {
    console.log('🚀 Iniciando MongoDB Memory Server...');
    
    // Crear instancia de MongoDB en memoria
    const mongod = await MongoMemoryServer.create({
      instance: {
        port: 27017,
        dbName: 'beniken_db'
      }
    });
    
    const uri = mongod.getUri();
    console.log('✅ MongoDB iniciado:', uri);
    
    // Configurar variables de entorno
    process.env.MONGODB_URI = uri;
    process.env.PORT = '5000';
    process.env.NODE_ENV = 'development';
    process.env.JWT_SECRET = 'dev-jwt-secret-beniken-2024';
    process.env.CLIENT_URL = 'http://localhost:3001,http://localhost:3000';
    
    console.log('🔧 Variables configuradas');
    console.log('📡 Puerto:', process.env.PORT);
    console.log('🌐 CORS:', process.env.CLIENT_URL);
    
    // Importar servidor principal
    console.log('🚀 Iniciando Express server...');
    await import('./server.js');
    
    console.log('✅ Servidor backend iniciado correctamente');
    console.log('🔗 Health check: http://localhost:5000/api/health');
    console.log('📦 Products API: http://localhost:5000/api/products');
    console.log('📋 Orders API: http://localhost:5000/api/orders');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

startServer();
