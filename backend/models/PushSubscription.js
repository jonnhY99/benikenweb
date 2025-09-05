import mongoose from 'mongoose';

const pushSubscriptionSchema = new mongoose.Schema({
  userEmail: {
    type: String,
    required: true,
    index: true
  },
  orderId: {
    type: String,
    index: true
  },
  endpoint: {
    type: String,
    required: true,
    unique: true
  },
  keys: {
    p256dh: {
      type: String,
      required: true
    },
    auth: {
      type: String,
      required: true
    }
  },
  userAgent: {
    type: String
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastNotificationSent: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Índice compuesto para búsquedas eficientes
pushSubscriptionSchema.index({ userEmail: 1, isActive: 1 });
pushSubscriptionSchema.index({ orderId: 1, isActive: 1 });

// Middleware para actualizar updatedAt
pushSubscriptionSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Método para marcar como inactiva
pushSubscriptionSchema.methods.deactivate = function() {
  this.isActive = false;
  return this.save();
};

// Método estático para limpiar suscripciones antiguas
pushSubscriptionSchema.statics.cleanupOldSubscriptions = function(daysOld = 30) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysOld);
  
  return this.deleteMany({
    isActive: false,
    updatedAt: { $lt: cutoffDate }
  });
};

// Método estático para encontrar suscripciones por email
pushSubscriptionSchema.statics.findByEmail = function(email) {
  return this.find({ userEmail: email, isActive: true });
};

// Método estático para encontrar suscripciones por pedido
pushSubscriptionSchema.statics.findByOrderId = function(orderId) {
  return this.find({ orderId: orderId, isActive: true });
};

export default mongoose.model('PushSubscription', pushSubscriptionSchema);
