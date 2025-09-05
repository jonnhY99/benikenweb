// backend/start-local.js
// Script para conectar al MongoDB local existente (beniken_db)

async function startLocalServer() {
  try {
    console.log('🚀 Iniciando servidor con MongoDB local...');
    
    // Configurar variables de entorno para MongoDB local
    process.env.MONGODB_URI = 'mongodb://localhost:27017/beniken_db';
    process.env.PORT = '5000';
    process.env.NODE_ENV = 'development';
    process.env.JWT_SECRET = 'beniken-jwt-secret-2024';
    process.env.CLIENT_URL = 'http://localhost:3001,http://localhost:3000';
    
    console.log('🔧 Variables configuradas:');
    console.log('📦 MongoDB URI:', process.env.MONGODB_URI);
    console.log('📡 Puerto:', process.env.PORT);
    console.log('🌐 CORS:', process.env.CLIENT_URL);
    
    // Importar servidor principal
    console.log('🚀 Iniciando Express server...');
    await import('./server.js');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

startLocalServer();
