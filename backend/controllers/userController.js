import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';

// Esquema para guardar logs de inicio de sesión
const loginLogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  email: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
});

const LoginLog = mongoose.model('LoginLog', loginLogSchema);

// Registrar usuario
export const registerUser = async (req, res) => {
  try {
    const user = new User(req.body);
    const savedUser = await user.save();
    res.status(201).json(savedUser);
  } catch (error) {
    res.status(400).json({ message: 'Error al registrar usuario', error });
  }
};

// Login usuario
export const loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });

    const isMatch = await user.matchPassword(password);
    if (!isMatch) return res.status(400).json({ message: 'Contraseña incorrecta' });

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });

    // Guardar log automáticamente
    const log = new LoginLog({ userId: user._id, email: user.email });
    await log.save();

    res.json({ token, user });
  } catch (error) {
    res.status(500).json({ message: 'Error en el login', error });
  }
};

// Listar usuarios (solo admin)
export const getUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener usuarios', error });
  }
};

// Listar logs de login (solo admin)
export const getLoginLogs = async (req, res) => {
  try {
    const logs = await LoginLog.find()
      .populate('userId', 'name email role')
      .sort({ timestamp: -1 });
    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener logs de login', error });
  }
};
