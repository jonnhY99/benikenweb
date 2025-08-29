import User from '../models/User.js';
import LoginLog from '../models/LoginLog.js';
import jwt from 'jsonwebtoken';

// =========================
// Registrar usuario
// =========================
export const registerUser = async (req, res) => {
  try {
    const user = new User(req.body);
    const savedUser = await user.save();
    res.status(201).json(savedUser);
  } catch (error) {
    res.status(400).json({ message: 'Error al registrar usuario', error: error.message });
  }
};

// =========================
// Login usuario
// =========================
export const loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });

    const isMatch = await user.matchPassword(password);
    if (!isMatch) return res.status(400).json({ message: 'Contraseña incorrecta' });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    // Guardar log automáticamente
    const log = new LoginLog({ userId: user._id, email: user.email });
    await log.save();

    res.json({ token, user });
  } catch (error) {
    res.status(500).json({ message: 'Error en el login', error: error.message });
  }
};

// =========================
// Listar usuarios (solo admin)
// =========================
export const getUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener usuarios', error: error.message });
  }
};

// =========================
// Listar logs de login (solo admin)
// =========================
export const getLoginLogs = async (req, res) => {
  try {
    const logs = await LoginLog.find()
      .populate('userId', 'name email role')
      .sort({ timestamp: -1 });
    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener logs de login', error: error.message });
  }
};

// =========================
// Actualizar usuario (solo admin)
// =========================
export const updateUser = async (req, res) => {
  try {
    const { name, email, role, password, isFrequent } = req.body;

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    user.name = name || user.name;
    user.email = email || user.email;
    user.role = role || user.role;

    if (typeof isFrequent !== 'undefined') {
      user.isFrequent = isFrequent;
    }

    if (password && password.trim() !== "") {
      user.password = password; // se encripta en pre('save')
    }

    const updatedUser = await user.save();
    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar usuario', error: error.message });
  }
};

// =========================
// Eliminar usuario (solo admin)
// =========================
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    await user.deleteOne();
    res.json({ message: 'Usuario eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar usuario', error: error.message });
  }
};

// =========================
// Registrar compra y marcar frecuentes
// =========================
export const registerPurchase = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    user.purchases += 1;

    if (user.purchases >= 2) {
      user.isFrequent = true;
    }

    await user.save();
    res.json({ message: 'Compra registrada', user });
  } catch (error) {
    res.status(500).json({ message: 'Error al registrar compra', error: error.message });
  }
};

// =========================
// Obtener solo usuarios frecuentes
// =========================
export const getFrequentUsers = async (req, res) => {
  try {
    const users = await User.find({ isFrequent: true }).select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener usuarios frecuentes', error: error.message });
  }
};
