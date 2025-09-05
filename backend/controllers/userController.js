import User from '../models/User.js';
import LoginLog from '../models/LoginLog.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { encrypt, decrypt, hashValue } from '../config/encryption.js';

// Test function for encryption
export const testEncryption = async (req, res) => {
  try {
    console.log('🔐 Testing Encryption Functions...\n');
    
    // Test 1: Basic encryption and decryption
    const testEmail = 'test@beniken.com';
    const encrypted = encrypt(testEmail);
    console.log('✅ Encryption successful:', encrypted);
    
    const decrypted = decrypt(encrypted);
    console.log('✅ Decryption successful:', decrypted);
    console.log('✅ Match:', testEmail === decrypted ? 'YES' : 'NO');
    
    // Test 2: Hash functionality
    const emailHash = hashValue(encrypted.data);
    console.log('✅ Email hash created:', emailHash);
    
    // Test 3: Search simulation
    const searchHash = hashValue(encrypt(testEmail).data);
    console.log('✅ Search hash matches:', emailHash === searchHash ? 'YES' : 'NO');
    
    res.json({
      message: 'Encryption test completed',
      results: {
        originalEmail: testEmail,
        encrypted: encrypted,
        decrypted: decrypted,
        encryptionWorks: testEmail === decrypted,
        emailHash: emailHash,
        searchHashMatches: emailHash === searchHash
      }
    });
  } catch (error) {
    console.error('❌ Encryption test failed:', error);
    res.status(500).json({ 
      message: 'Encryption test failed', 
      error: error.message 
    });
  }
};

// =========================
// Registrar usuario
// =========================
export const registerUser = async (req, res) => {
  try {
    const { name, email, password, role, isFrequent } = req.body;
    
    // Cifrar y hashear manualmente como en registerPurchase
    const encryptedName = encrypt(name);
    const encryptedEmail = encrypt(email.toLowerCase());
    
    const user = new User({
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
      password: password,
      role: role || 'cliente',
      isFrequent: isFrequent || false,
      purchases: 0
    });
    
    const savedUser = await user.save();
    console.log('✅ User registered successfully:', savedUser._id);
    
    // Descifrar datos antes de enviar al frontend
    const decryptedUser = {
      ...savedUser.toObject(),
      name: name,
      email: email.toLowerCase()
    };
    
    res.status(201).json(decryptedUser);
  } catch (error) {
    console.error('Error in registerUser:', error);
    res.status(400).json({ message: 'Error al registrar usuario', error: error.message });
  }
};

// =========================
// Login usuario
// =========================
export const loginUser = async (req, res) => {
  const { email, password } = req.body;
  
  // Helper para obtener IP del cliente
  const getClientIp = (req) => {
    return req.headers['x-forwarded-for']?.split(',')[0] || 
           req.connection?.remoteAddress || 
           req.socket?.remoteAddress || 
           req.ip || 
           'unknown';
  };

  try {
    // Buscar usuario por emailHash ya que los emails están encriptados
    const emailHash = hashValue(encrypt(email).data);
    const user = await User.findOne({ emailHash });
    
    if (!user) {
      // Log de intento fallido - usuario no encontrado
      await LoginLog.logFailedLogin(
        null, 
        email, 
        'Usuario no encontrado',
        getClientIp(req),
        req.headers['user-agent'] || 'Unknown'
      );
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    const isMatch = await user.matchPassword(password);
    
    if (!isMatch) {
      // Log de intento fallido - contraseña incorrecta
      await LoginLog.logFailedLogin(
        user._id,
        user.email,
        'Contraseña incorrecta',
        getClientIp(req),
        req.headers['user-agent'] || 'Unknown',
        user.name,
        user.role
      );
      return res.status(400).json({ message: 'Contraseña incorrecta' });
    }

    // Login exitoso
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    // Log de login exitoso
    await LoginLog.logSuccessfulLogin(
      user._id,
      user.email,
      getClientIp(req),
      req.headers['user-agent'] || 'Unknown',
      user.name,
      user.role
    );

    res.json({ token, user });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ message: 'Error en el login', error: error.message });
  }
};

// =========================
// Listar usuarios (solo admin)
// Obtener todos los usuarios (solo admin)
export const getUsers = async (req, res) => {
  try {
    console.log('🔍 Getting all users...');
    console.log('🔍 User making request:', req.user);
    
    const users = await User.find({}).lean();
    console.log(`📊 Found ${users.length} users in database`);
    
    // Desencriptar datos para mostrar
    const decryptedUsers = users.map(user => {
      const decryptedUser = { ...user };
      
      // Desencriptar nombre si está encriptado
      if (user.name && typeof user.name === 'object' && user.name.iv && user.name.data) {
        try {
          decryptedUser.name = decrypt(user.name);
        } catch (error) {
          console.error('Error decrypting name for user:', user._id);
          decryptedUser.name = '[Error desencriptando]';
        }
      }
      
      // Desencriptar email si está encriptado
      if (user.email && typeof user.email === 'object' && user.email.iv && user.email.data) {
        try {
          decryptedUser.email = decrypt(user.email);
        } catch (error) {
          console.error('Error decrypting email for user:', user._id);
          decryptedUser.email = '[Error desencriptando]';
        }
      }
      
      return decryptedUser;
    });
    
    console.log('✅ Users decrypted successfully, returning:', decryptedUsers.length, 'users');
    res.json(decryptedUsers);
  } catch (error) {
    console.error('❌ Error getting users:', error);
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

    if (name) {
      const encryptedName = encrypt(name);
      user.name = {
        iv: encryptedName.iv,
        data: encryptedName.data,
        tag: encryptedName.tag
      };
      user.nameHash = hashValue(encryptedName.data);
    }

    if (email) {
      const encryptedEmail = encrypt(email);
      user.email = {
        iv: encryptedEmail.iv,
        data: encryptedEmail.data,
        tag: encryptedEmail.tag
      };
      user.emailHash = hashValue(encryptedEmail.data);
    }

    if (typeof isFrequent !== 'undefined') {
      user.isFrequent = isFrequent;
    }

    if (password && password.trim() !== "") {
      user.password = password; // se encripta en pre('save')
    }

    const updatedUser = await user.save();
    // Descifrar datos antes de enviar al frontend con manejo de errores
    const userObj = updatedUser.toObject();
    try {
      const decryptedUser = {
        ...userObj,
        name: userObj.name && typeof userObj.name === 'object' ? decrypt(userObj.name) : userObj.name || 'N/A',
        email: userObj.email && typeof userObj.email === 'object' ? decrypt(userObj.email) : userObj.email || 'N/A'
      };
      res.json(decryptedUser);
    } catch (decryptError) {
      console.warn('Error decrypting updated user data:', updatedUser._id, decryptError.message);
      res.json({
        ...userObj,
        name: 'Error al descifrar',
        email: 'Error al descifrar'
      });
    }
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
  console.log('🔍 registerPurchase called with:', req.body);
  try {
    const { email } = req.body;
    
    if (!email) {
      console.log('❌ No email provided');
      return res.status(400).json({ message: 'Email es requerido' });
    }

    // Buscar usuario por emailHash ya que los emails están encriptados
    const emailHash = hashValue(encrypt(email).data);
    console.log('🔍 Looking for user with emailHash:', emailHash);
    let user = await User.findOne({ emailHash });

    if (!user) {
      console.log('❌ User not found for email:', email);
      console.log('✅ Creating new user automatically');
      
      // Crear usuario automáticamente si no existe
      // Generar hashes manualmente ya que el middleware no se ejecuta a tiempo
      const encryptedName = encrypt('Cliente');
      const encryptedEmail = encrypt(email);
      
      const newUser = new User({
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
        password: 'defaultPassword123', // Contraseña temporal
        isFrequent: false,
        purchases: 1, // Primera compra
        role: 'cliente'
      });
      
      const savedUser = await newUser.save();
      console.log('✅ New user created:', savedUser._id);
      user = savedUser; // Asignar el nuevo usuario para continuar el flujo
    } else {
      console.log('✅ User found:', user._id, 'Current purchases:', user.purchases);
      user.purchases += 1;

      if (user.purchases >= 2) {
        user.isFrequent = true;
        console.log('✅ User marked as frequent');
      }

      await user.save();
      console.log('✅ Purchase registered successfully');
    }

    // Descifrar datos antes de enviar al frontend con manejo de errores
    const userObj = user.toObject();
    try {
      const decryptedUser = {
        ...userObj,
        name: userObj.name && typeof userObj.name === 'object' ? decrypt(userObj.name) : userObj.name || 'N/A',
        email: userObj.email && typeof userObj.email === 'object' ? decrypt(userObj.email) : userObj.email || 'N/A'
      };
      res.json({ message: 'Compra registrada', user: decryptedUser });
    } catch (decryptError) {
      console.warn('Error decrypting purchase user data:', user._id, decryptError.message);
      res.json({ 
        message: 'Compra registrada', 
        user: {
          ...userObj,
          name: 'Error al descifrar',
          email: 'Error al descifrar'
        }
      });
    }
  } catch (error) {
    console.error('❌ Error en registerPurchase:', error);
    res.status(500).json({ message: 'Error al registrar compra', error: error.message });
  }
};

// =========================
// Obtener solo usuarios frecuentes
// =========================
export const getFrequentUsers = async (req, res) => {
  try {
    const users = await User.find({ isFrequent: true }).select('-password');
    // Descifrar datos antes de enviar al frontend con manejo de errores
    const decryptedUsers = users.map(user => {
      const userObj = user.toObject();
      try {
        return {
          ...userObj,
          name: userObj.name && typeof userObj.name === 'object' ? decrypt(userObj.name) : userObj.name || 'N/A',
          email: userObj.email && typeof userObj.email === 'object' ? decrypt(userObj.email) : userObj.email || 'N/A'
        };
      } catch (decryptError) {
        console.warn('Error decrypting frequent user data:', user._id, decryptError.message);
        return {
          ...userObj,
          name: 'Error al descifrar',
          email: 'Error al descifrar'
        };
      }
    });
    res.json(decryptedUsers);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener usuarios frecuentes', error: error.message });
  }
};
