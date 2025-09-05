import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from './models/User.js';
import { encrypt, hashValue } from './config/encryption.js';

dotenv.config();

console.log('🧪 PRUEBA DE PREVENCIÓN DE USUARIOS DUPLICADOS\n');

async function testDuplicateUsers() {
  try {
    // Conectar a MongoDB
    console.log('📡 Conectando a MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Conectado a MongoDB');

    const testEmail = 'test-duplicate@example.com';
    const testName = 'Usuario Prueba';

    // Limpiar usuarios de prueba existentes
    console.log('🧹 Limpiando usuarios de prueba existentes...');
    const emailHash = hashValue(encrypt(testEmail).data);
    await User.deleteMany({ emailHash });
    console.log('✅ Usuarios de prueba eliminados');

    console.log('\n1. 🧪 Probando creación de primer usuario...');
    
    // Simular registro de usuario
    const encryptedName1 = encrypt(testName);
    const encryptedEmail1 = encrypt(testEmail);
    
    const user1 = new User({
      name: {
        iv: encryptedName1.iv,
        data: encryptedName1.data,
        tag: encryptedName1.tag
      },
      email: {
        iv: encryptedEmail1.iv,
        data: encryptedEmail1.data,
        tag: encryptedEmail1.tag
      },
      nameHash: hashValue(encryptedName1.data),
      emailHash: hashValue(encryptedEmail1.data),
      password: 'password123',
      role: 'cliente',
      isFrequent: false,
      purchases: 0
    });

    await user1.save();
    console.log('✅ Primer usuario creado exitosamente:', user1._id);

    console.log('\n2. 🧪 Probando detección de duplicado...');
    
    // Verificar si existe usuario con mismo email
    const existingUser = await User.findOne({ emailHash });
    
    if (existingUser) {
      console.log('✅ Usuario duplicado detectado correctamente');
      console.log('   ID del usuario existente:', existingUser._id);
      console.log('   Compras actuales:', existingUser.purchases);
    } else {
      console.log('❌ No se detectó el usuario existente');
    }

    console.log('\n3. 🧪 Probando registro de compra en usuario existente...');
    
    if (existingUser) {
      existingUser.purchases += 1;
      
      if (existingUser.purchases >= 2) {
        existingUser.isFrequent = true;
        console.log('✅ Usuario marcado como frecuente');
      }
      
      await existingUser.save();
      console.log('✅ Compra registrada, total compras:', existingUser.purchases);
    }

    console.log('\n4. 🧪 Verificando conteo final...');
    const finalCount = await User.countDocuments({ emailHash });
    console.log(`📊 Usuarios con email ${testEmail}: ${finalCount}`);
    
    if (finalCount === 1) {
      console.log('✅ Prevención de duplicados funcionando correctamente');
    } else {
      console.log('❌ Se encontraron usuarios duplicados');
    }

    // Limpiar
    await User.deleteMany({ emailHash });
    console.log('🧹 Usuarios de prueba eliminados');

    await mongoose.disconnect();
    console.log('\n✅ Desconectado de MongoDB');

  } catch (error) {
    console.error('❌ Error en prueba:', error);
  }
}

testDuplicateUsers();
