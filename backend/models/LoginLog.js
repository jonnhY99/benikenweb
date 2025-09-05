// backend/models/LoginLog.js
import mongoose from 'mongoose';

const loginLogSchema = new mongoose.Schema(
  {
    userId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User', 
      required: true 
    },
    name: { 
      type: String, 
      required: true,
      trim: true 
    },
    email: { 
      type: String, 
      required: true,
      lowercase: true,
      trim: true 
    },
    role: { 
      type: String, 
      required: true,
      enum: ['admin', 'carniceria', 'cliente'],
      default: 'cliente'
    },
    ip: { 
      type: String, 
      default: '-',
      trim: true 
    },
    userAgent: { 
      type: String, 
      default: '-',
      trim: true 
    },
    loginMethod: {
      type: String,
      enum: ['password', 'token', 'social'],
      default: 'password'
    },
    success: {
      type: Boolean,
      default: true
    },
    errorMessage: {
      type: String,
      default: null
    }
  },
  { 
    timestamps: true, // createdAt / updatedAt automáticos
    collection: 'loginlogs' // nombre explícito de la colección
  }
);

// índices para búsquedas rápidas y rendimiento
loginLogSchema.index({ createdAt: -1 });
loginLogSchema.index({ email: 1 });
loginLogSchema.index({ role: 1 });
loginLogSchema.index({ userId: 1 });
loginLogSchema.index({ success: 1 });
loginLogSchema.index({ ip: 1 });

// Método estático para crear log de login exitoso
loginLogSchema.statics.logSuccessfulLogin = async function(userId, email, ip, userAgent, name, role) {
  try {
    const loginLog = new this({
      userId: userId,
      name: name || 'Usuario sin nombre',
      email: email,
      role: role || 'cliente',
      ip: ip || '-',
      userAgent: userAgent || 'Unknown',
      loginMethod: 'password',
      success: true
    });
    
    await loginLog.save();
    return loginLog;
  } catch (error) {
    console.error('Error saving login log:', error);
    throw error;
  }
};

// Método estático para crear log de login fallido
loginLogSchema.statics.logFailedLogin = async function(userId, email, errorMessage, ip, userAgent, name, role) {
  try {
    // Para logs fallidos, userId puede ser null
    const tempUserId = userId || new mongoose.Types.ObjectId();
    
    const loginLog = new this({
      userId: tempUserId,
      name: name || 'Login fallido',
      email: email || 'email-desconocido',
      role: role || 'unknown',
      ip: ip || '-',
      userAgent: userAgent || 'Unknown',
      loginMethod: 'password',
      success: false,
      errorMessage: errorMessage || 'Credenciales inválidas'
    });
    
    await loginLog.save();
    return loginLog;
  } catch (error) {
    console.error('Error saving failed login log:', error);
    // No lanzar error para no interrumpir el flujo de login
    return null;
  }
};

// Función helper para obtener IP del cliente
function getClientIp(req) {
  const xForwardedFor = req.headers['x-forwarded-for'];
  if (xForwardedFor) {
    return xForwardedFor.split(',')[0].trim();
  }
  return req.ip || req.connection?.remoteAddress || req.socket?.remoteAddress || '-';
}

export default mongoose.model('LoginLog', loginLogSchema);
