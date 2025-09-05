// Script para crear usuario admin
import mongoose from 'mongoose';
import User from './models/User.js';
import { encrypt, hashValue } from './config/encryption.js';
import 'dotenv/config';

const MONGODB_URI = process.env.MONGODB_URI;

async function createAdminUser() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ MongoDB conectado');

    // Verificar si ya existe
    const adminEmail = 'admin@beniken.com';
    const emailHash = hashValue(encrypt(adminEmail).data);
    const existingAdmin = await User.findOne({ emailHash });
    
    if (existingAdmin) {
      console.log('❌ Usuario admin ya existe');
      return;
    }

    // Crear usuario admin
    const encryptedName = encrypt('Administrador');
    const encryptedEmail = encrypt(adminEmail);
    
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
      password: 'admin123', // Se hasheará automáticamente
      role: 'admin',
      isFrequent: false,
      purchases: 0
    });

    const savedUser = await adminUser.save();
    console.log('✅ Usuario admin creado:', savedUser._id);
    console.log('📧 Email:', adminEmail);
    console.log('🔑 Password: admin123');
    console.log('👤 Role: admin');
    
  } catch (error) {
    console.error('❌ Error creando admin:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Desconectado de MongoDB');
  }
}

createAdminUser();
