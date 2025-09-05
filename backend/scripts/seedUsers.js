import 'dotenv/config';
import mongoose from 'mongoose';
import User from '../models/User.js';

const users = [
  { name: 'Administrador', email: 'admin@beniken.com', password: 'admin123', role: 'admin' },
  { name: 'Carnicería Local', email: 'carniceria@beniken.com', password: 'carne123', role: 'carniceria' },
  { name: 'Cliente Axel', email: 'axel@beniken.com', password: 'axel123', role: 'cliente' }
];

(async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 8000 });
    console.log('✅ Conectado a MongoDB');

    await User.deleteMany();
    console.log('🗑 Usuarios anteriores eliminados');

    const createdUsers = [];
    for (const data of users) {
      const user = new User(data);
      const savedUser = await user.save(); // ejecuta el pre('save')
      createdUsers.push({
        id: savedUser._id,
        email: savedUser.email,
        role: savedUser.role,
        passwordHashed: savedUser.password.startsWith('$2b$')
      });
    }

    console.log('✅ Usuarios creados:', createdUsers);
  } catch (err) {
    console.error('❌ Error al poblar usuarios:', err.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Desconectado de MongoDB');
  }
})();
