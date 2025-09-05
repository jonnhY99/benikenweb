import dotenv from 'dotenv';
dotenv.config();

console.log('🧪 PRUEBA DEL ENDPOINT DE USUARIOS\n');

// Test directo del controlador
console.log('1. Probando función getUsers directamente...');
try {
  const { getUsers } = await import('./controllers/userController.js');
  
  // Mock request y response
  const mockReq = {
    user: { id: 'test', role: 'admin' }
  };
  
  const mockRes = {
    json: (data) => {
      console.log('✅ Respuesta del controlador:');
      console.log('📊 Usuarios encontrados:', data.length);
      data.forEach((user, index) => {
        console.log(`${index + 1}. ${user.name} (${user.email}) - Rol: ${user.role}`);
      });
    },
    status: (code) => ({
      json: (data) => {
        console.log(`❌ Error ${code}:`, data);
      }
    })
  };
  
  await getUsers(mockReq, mockRes);
  
} catch (error) {
  console.error('❌ Error en prueba directa:', error);
}

console.log('\n2. Verificando conexión a base de datos...');
try {
  const mongoose = await import('mongoose');
  const User = (await import('./models/User.js')).default;
  
  // Conectar a MongoDB
  await mongoose.default.connect(process.env.MONGODB_URI);
  console.log('✅ Conectado a MongoDB');
  
  const userCount = await User.countDocuments();
  console.log(`📊 Total de usuarios en BD: ${userCount}`);
  
  if (userCount > 0) {
    const sampleUser = await User.findOne().lean();
    console.log('👤 Usuario de muestra:', {
      id: sampleUser._id,
      name: typeof sampleUser.name,
      email: typeof sampleUser.email,
      role: sampleUser.role
    });
  }
  
  await mongoose.default.disconnect();
  console.log('✅ Desconectado de MongoDB');
  
} catch (error) {
  console.error('❌ Error con base de datos:', error);
}
