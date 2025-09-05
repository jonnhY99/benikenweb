// backend/routes/auth.js
import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

import User from '../models/User.js';
import LoginLog from '../models/LoginLog.js';
import { encrypt, decrypt, hashValue } from '../config/encryption.js';

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '12h';

function getClientIp(req) {
  const xf = req.headers['x-forwarded-for'];
  if (xf) return xf.split(',')[0].trim();
  return req.ip || req.connection?.remoteAddress || '-';
}

// === LOGIN SIN TOKEN/OTP ===
console.log('🔍 Registering /login route');
router.post('/login', async (req, res) => {
  console.log('🔍 Login attempt with:', req.body);
  try {
    const { email, password } = req.body ?? {};
    if (!email || !password) {
      return res.status(400).json({ message: 'Email y contraseña son requeridos.' });
    }

    // Buscar usuario por email directo primero (para compatibilidad)
    console.log('🔍 Searching for user with email:', email.toLowerCase());
    
    const users = await User.find({}).lean();
    console.log('🔍 Total users in database:', users.length);
    
    let user = null;
    // Buscar usuario comparando emails descifrados
    for (const dbUser of users) {
      try {
        // Verificar si el email tiene la estructura correcta para descifrar
        if (dbUser.email && typeof dbUser.email === 'object' && dbUser.email.iv && dbUser.email.data) {
          const decryptedEmail = decrypt(dbUser.email);
          console.log('🔍 Checking user email:', decryptedEmail);
          if (decryptedEmail && decryptedEmail.toLowerCase() === email.toLowerCase()) {
            user = dbUser;
            console.log('✅ Found user by decrypted email match');
            break;
          }
        } else {
          console.log('⚠️ Invalid email structure for user:', dbUser._id);
        }
      } catch (err) {
        console.log('⚠️ Could not decrypt email for user:', dbUser._id, err.message);
      }
    }
    if (!user) {
      console.log('❌ User not found for email:', email);
      console.log('🔧 Creating admin user automatically if this is admin@beniken.com');
      
      // Crear usuario admin automáticamente si es el email admin
      if (email.toLowerCase() === 'admin@beniken.com') {
        const encryptedName = encrypt('Administrador');
        const encryptedEmail = encrypt(email.toLowerCase());
        
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

        const savedAdmin = await adminUser.save();
        console.log('✅ Admin user created automatically:', savedAdmin._id);
        
        // Continuar con el login del usuario recién creado
        const newUser = await User.findById(savedAdmin._id).lean();
        if (newUser) {
          const ok = await bcrypt.compare(password, newUser.password);
          if (ok) {
            const decryptedName = decrypt(newUser.name);
            const decryptedEmail = decrypt(newUser.email);
            const payload = { id: newUser._id.toString(), email: decryptedEmail, role: newUser.role };
            const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
            return res.json({
              token,
              user: {
                id: newUser._id.toString(),
                name: decryptedName,
                email: decryptedEmail,
                role: newUser.role,
              },
            });
          }
        }
      }
      
      return res.status(401).json({ message: 'Correo o contraseña inválidos' });
    }
    
    console.log('✅ User found:', user.name, 'Role:', user.role);

    const ok = await bcrypt.compare(password, user.password);
    console.log('🔍 Password comparison result:', ok);
    if (!ok) {
      console.log('❌ Password mismatch for user:', email);
      return res.status(401).json({ message: 'Correo o contraseña inválidos' });
    }
    
    console.log('✅ Login successful for:', email);

    // Descifrar datos antes de enviar al frontend
    const decryptedName = decrypt(user.name);
    const decryptedEmail = decrypt(user.email);
    
    const payload = { id: user._id.toString(), email: decryptedEmail, role: user.role };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

    // Log de inicio (no bloquea si falla)
    try {
      await LoginLog.create({
        userId: user._id,
        name: user.name || '',
        email: user.email,
        role: user.role,
        ip: getClientIp(req),
        userAgent: req.headers['user-agent'] || '',
        createdAt: new Date(),
      });
    } catch (e) {
      console.warn('No se pudo guardar login log:', e.message || e);
    }

    return res.json({
      token,
      user: {
        id: user._id.toString(),
        name: decryptedName,
        email: decryptedEmail,
        role: user.role,
      },
    });
  } catch (err) {
    console.error('Error en /api/auth/login:', err);
    return res.status(500).json({ message: 'Error interno' });
  }
});

export default router;
