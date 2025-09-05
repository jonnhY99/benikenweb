import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from './models/User.js';
import { decrypt } from './config/encryption.js';

dotenv.config();

console.log('🔍 PRUEBA DIRECTA DE USUARIOS EN BASE DE DATOS\n');

async function testDirectUsers() {
  try {
    // Conectar a MongoDB
    console.log('📡 Conectando a MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Conectado a MongoDB');

    // Contar usuarios
    const userCount = await User.countDocuments();
    console.log(`📊 Total usuarios en BD: ${userCount}`);

    if (userCount === 0) {
      console.log('❌ No hay usuarios en la base de datos');
      return;
    }

    // Obtener todos los usuarios
    console.log('\n🔍 Obteniendo usuarios...');
    const users = await User.find({}).lean();
    
    console.log('\n👥 USUARIOS ENCONTRADOS:');
    users.forEach((user, index) => {
      console.log(`\n${index + 1}. Usuario ID: ${user._id}`);
      
      // Intentar desencriptar nombre
      try {
        if (user.name && typeof user.name === 'object') {
          const decryptedName = decrypt(user.name);
          console.log(`   Nombre: ${decryptedName}`);
        } else {
          console.log(`   Nombre: ${user.name || 'N/A'}`);
        }
      } catch (error) {
        console.log(`   Nombre: [Error desencriptando]`);
      }

      // Intentar desencriptar email
      try {
        if (user.email && typeof user.email === 'object') {
          const decryptedEmail = decrypt(user.email);
          console.log(`   Email: ${decryptedEmail}`);
        } else {
          console.log(`   Email: ${user.email || 'N/A'}`);
        }
      } catch (error) {
        console.log(`   Email: [Error desencriptando]`);
      }

      console.log(`   Rol: ${user.role}`);
      console.log(`   Frecuente: ${user.isFrequent ? 'Sí' : 'No'}`);
    });

    // Buscar usuarios admin
    console.log('\n🔍 Buscando usuarios admin...');
    const adminUsers = users.filter(user => user.role === 'admin');
    console.log(`📊 Usuarios admin encontrados: ${adminUsers.length}`);

    if (adminUsers.length > 0) {
      console.log('\n👑 USUARIOS ADMIN:');
      adminUsers.forEach((admin, index) => {
        try {
          const name = admin.name && typeof admin.name === 'object' ? decrypt(admin.name) : admin.name;
          const email = admin.email && typeof admin.email === 'object' ? decrypt(admin.email) : admin.email;
          console.log(`${index + 1}. ${name} (${email})`);
        } catch (error) {
          console.log(`${index + 1}. [Error desencriptando datos]`);
        }
      });
    }

    await mongoose.disconnect();
    console.log('\n✅ Desconectado de MongoDB');

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

testDirectUsers();
