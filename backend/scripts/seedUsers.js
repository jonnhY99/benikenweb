import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';

dotenv.config();

const users = [
  {
    name: 'Administrador',
    email: 'admin@beniken.com',
    password: 'admin123',      // se cifrará automáticamente
    role: 'admin'
  },
  {
    name: 'Carnicería Local',
    email: 'carniceria@beniken.com',
    password: 'carniceria123', // se cifrará automáticamente
    role: 'carniceria'
  },
  {
    name: 'Cliente Juan',
    email: 'juan@beniken.com',
    password: 'juan123',       // se cifrará automáticamente
    role: 'cliente'
  }
];

const seedUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Conectado a MongoDB');

    // Eliminar usuarios previos
    await User.deleteMany();
    console.log('Usuarios anteriores eliminados');

    // Insertar uno por uno para que el hook pre('save') cifre las contraseñas
    const createdUsers = [];
    for (const data of users) {
      const user = new User(data);
      const savedUser = await user.save();
      createdUsers.push({
        id: savedUser._id,
        email: savedUser.email,
        role: savedUser.role,
        passwordHashed: savedUser.password.startsWith('$2b$') // verifica si se cifró
      });
    }

    console.log('Usuarios creados:', createdUsers);
    console.log(`${createdUsers.length} usuarios insertados con contraseñas cifradas`);
    mongoose.connection.close();
  } catch (error) {
    console.error('Error al poblar usuarios:', error);
    mongoose.connection.close();
  }
};

seedUsers();
