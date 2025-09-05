// backend/start-dev.js
// Script para iniciar el servidor con MongoDB Memory Server para desarrollo
import { MongoMemoryServer } from 'mongodb-memory-server';
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function startDevServer() {
  console.log('🚀 Iniciando servidor de desarrollo...');
  
  try {
    // Iniciar MongoDB Memory Server
    console.log('📦 Iniciando MongoDB Memory Server...');
    const mongod = await MongoMemoryServer.create({
      instance: {
        port: 27017, // Puerto fijo para consistencia
        dbName: 'beniken_db'
      }
    });
    
    const uri = mongod.getUri();
    console.log('✅ MongoDB Memory Server iniciado en:', uri);
    
    // Configurar variables de entorno
    process.env.MONGODB_URI = uri;
    process.env.PORT = process.env.PORT || '5000';
    process.env.NODE_ENV = 'development';
    process.env.JWT_SECRET = process.env.JWT_SECRET || 'dev-jwt-secret-key';
    process.env.CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:3001,http://localhost:3000';
    
    console.log('🔧 Variables de entorno configuradas');
    console.log('📡 Puerto del servidor:', process.env.PORT);
    console.log('🌐 CORS permitido:', process.env.CLIENT_URL);
    
    // Importar y iniciar el servidor principal
    console.log('🚀 Iniciando servidor Express...');
    await import('./server.js');
    
  } catch (error) {
    console.error('❌ Error iniciando el servidor de desarrollo:', error);
    process.exit(1);
  }
}

// Manejar cierre limpio
process.on('SIGINT', () => {
  console.log('\n🛑 Cerrando servidor de desarrollo...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Cerrando servidor de desarrollo...');
  process.exit(0);
});

startDevServer();
