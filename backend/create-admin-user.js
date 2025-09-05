import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from './models/User.js';
import { encrypt, hashValue } from './config/encryption.js';
import bcrypt from 'bcryptjs';

dotenv.config();

console.log('👑 CREANDO USUARIO ADMINISTRADOR\n');

async function createAdminUser() {
  try {
    // Conectar a MongoDB
    console.log('📡 Conectando a MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Conectado a MongoDB');

    const adminEmail = 'admin@beniken.com';
    const adminPassword = 'admin123';
    const adminName = 'Administrador';

    // Verificar si ya existe un admin
    console.log('🔍 Verificando si ya existe admin...');
    const existingAdmin = await User.findOne({ role: 'admin' });
    
    if (existingAdmin) {
      console.log('⚠️ Ya existe un usuario admin');
      console.log('🔍 Actualizando usuario existente...');
      
      // Actualizar usuario existente
      const encryptedName = encrypt(adminName);
      const encryptedEmail = encrypt(adminEmail);
      const hashedPassword = await bcrypt.hash(adminPassword, 10);
      
      existingAdmin.name = {
        iv: encryptedName.iv,
        data: encryptedName.data,
        tag: encryptedName.tag
      };
      existingAdmin.email = {
        iv: encryptedEmail.iv,
        data: encryptedEmail.data,
        tag: encryptedEmail.tag
      };
      existingAdmin.nameHash = hashValue(encryptedName.data);
      existingAdmin.emailHash = hashValue(encryptedEmail.data);
      existingAdmin.password = hashedPassword;
      existingAdmin.role = 'admin';
      
      await existingAdmin.save();
      console.log('✅ Usuario admin actualizado');
    } else {
      console.log('➕ Creando nuevo usuario admin...');
      
      // Encriptar datos
      const encryptedName = encrypt(adminName);
      const encryptedEmail = encrypt(adminEmail);
      const hashedPassword = await bcrypt.hash(adminPassword, 10);
      
      const adminUser = new User({
        name: {
          iv: encryptedName.iv,
          data: encryptedName.data,
          tag: encryptedName.tag
        },
        email: {
          iv: encryptedEmail.iv,
          data: encryptedEmail.data,
          tag: encryptedEmail.tag
        },
        nameHash: hashValue(encryptedName.data),
        emailHash: hashValue(encryptedEmail.data),
        password: hashedPassword,
        role: 'admin',
        isFrequent: false,
        purchases: 0
      });
      
      await adminUser.save();
      console.log('✅ Usuario admin creado exitosamente');
    }

    console.log('\n📋 CREDENCIALES DE ADMIN:');
    console.log(`Email: ${adminEmail}`);
    console.log(`Password: ${adminPassword}`);
    console.log('\n💡 Usa estas credenciales para hacer login en /login');

    await mongoose.disconnect();
    console.log('\n✅ Desconectado de MongoDB');

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

createAdminUser();
